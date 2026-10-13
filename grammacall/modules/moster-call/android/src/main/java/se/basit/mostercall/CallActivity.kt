package se.basit.mostercall

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.telecom.Call
import android.telecom.VideoProfile
import android.telephony.PhoneNumberUtils
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.math.ceil

// Her call screen, as in the UI mockup. Native rather than React Native so it
// works even when the JS side is not running. Every call (including unknown
// numbers) lands here while we are the default phone app.
class CallActivity : Activity() {
  private enum class Mode { AUTO_ANSWER, RINGING, IN_CALL }

  private val handler = Handler(Looper.getMainLooper())
  private val dp by lazy { resources.displayMetrics.density }
  private val bold by lazy { font("AtkinsonHyperlegible_700Bold") ?: Typeface.DEFAULT_BOLD }
  private val regular by lazy { font("AtkinsonHyperlegible_400Regular") ?: Typeface.DEFAULT }

  private var mode: Mode? = null
  private var shownCall: Call? = null
  private var status: TextView? = null
  private var speakerPill: TextView? = null

  private val listener: () -> Unit = { runOnUiThread { render() } }
  private val ticker = object : Runnable {
    override fun run() {
      updateDynamic()
      handler.postDelayed(this, 500)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setShowWhenLocked(true)
    setTurnScreenOn(true)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  override fun onStart() {
    super.onStart()
    MosterInCallService.addListener(listener)
    handler.post(ticker)
    render()
  }

  override fun onStop() {
    MosterInCallService.removeListener(listener)
    handler.removeCallbacks(ticker)
    super.onStop()
  }

  private fun currentCall(): Call? = MosterInCallService.activeCalls.firstOrNull()

  private fun render() {
    try {
      val call = currentCall() ?: return finish()
      val state = call.details.state
      if (state == Call.STATE_DISCONNECTED) return finish()
      val next = when {
        state == Call.STATE_RINGING && call in MosterInCallService.autoAnswerAt -> Mode.AUTO_ANSWER
        state == Call.STATE_RINGING -> Mode.RINGING
        else -> Mode.IN_CALL
      }
      if (next != mode || call != shownCall) {
        mode = next
        shownCall = call
        setContentView(build(call, next))
      }
      updateDynamic()
    } catch (e: Exception) {
      Log.e(MosterInCallService.TAG, "CallActivity render failed", e)
    }
  }

  // Texts that change every tick: countdown, duration, speaker state.
  private fun updateDynamic() {
    val call = shownCall ?: return
    when (mode) {
      Mode.AUTO_ANSWER -> {
        val at = MosterInCallService.autoAnswerAt[call] ?: return
        val secs = ceil((at - System.currentTimeMillis()) / 1000.0).toInt().coerceAtLeast(0)
        status?.text = "Du kopplas fram\nom $secs ${if (secs == 1) "sekund" else "sekunder"}"
      }
      Mode.IN_CALL -> {
        status?.text = when (call.details.state) {
          Call.STATE_ACTIVE -> "Ni pratar nu · ${duration(call)}"
          Call.STATE_HOLDING -> "Väntar…"
          Call.STATE_DISCONNECTING -> "Samtalet avslutas"
          else -> "Ringer upp…"
        }
        val on = MosterInCallService.speakerOn
        speakerPill?.apply {
          text = if (on) "🔊  Högtalare på" else "Högtalare av"
          background = rounded(if (on) SUCCESS else MUTED_PILL, 999f)
        }
      }
      else -> {}
    }
  }

  private fun build(call: Call, mode: Mode): View {
    val number = call.details.handle?.schemeSpecificPart
    val contact = CallSettings.contactFor(this, number)
    val name = contact?.name
      ?: number?.let { PhoneNumberUtils.formatNumber(it, "SE") ?: it }
      ?: "Okänt nummer"
    val palette = contact?.let { PALETTES[it.position % PALETTES.size] } ?: UNKNOWN_PALETTE
    val portrait = PortraitView(this, contact?.photoUri, palette.first, palette.second, INK, 3 * dp)

    val page = column().apply { setBackgroundColor(Color.WHITE) }
    val center = column(gap = 24).apply { gravity = Gravity.CENTER }
    center.addView(portrait, LinearLayout.LayoutParams(px(200), px(200)))
    status = null
    speakerPill = null

    when (mode) {
      Mode.AUTO_ANSWER -> {
        page.addView(text("SVARAR AUTOMATISKT", 23f, bold, Color.WHITE).apply {
          gravity = Gravity.CENTER
          letterSpacing = 0.03f
          setBackgroundColor(SUCCESS)
        }, LinearLayout.LayoutParams(MATCH_PARENT, px(76)))
        center.addView(title("$name ringer"))
        status = text("", 26f, regular, MUTED).apply { gravity = Gravity.CENTER }
        center.addView(status)
        page.addView(center, weighted())
        page.addView(bigButton("SVARA NU", "om du inte vill vänta", SUCCESS, 180) { answer(call) }, bottom())
      }
      Mode.RINGING -> {
        center.addView(title(name))
        center.addView(text(if (contact == null) "Okänt nummer ringer" else "ringer dig", 26f, regular, MUTED))
        page.addView(center, weighted())
        page.addView(bigButton("SVARA", "tryck för att prata", SUCCESS, 150) { answer(call) }, bottom(gapBelow = 16))
        page.addView(bigButton("AVVISA", null, DANGER, 110) { call.reject(false, null) }, bottom())
      }
      Mode.IN_CALL -> {
        center.addView(title(name))
        status = text("", 28f, regular, MUTED).apply { gravity = Gravity.CENTER }
        center.addView(status)
        speakerPill = text("", 24f, bold, Color.WHITE).apply {
          setPadding(px(26), px(14), px(26), px(14))
          setOnClickListener {
            val on = MosterInCallService.speakerOn
            MosterInCallService.instance?.setSpeaker(!on)
          }
        }
        center.addView(speakerPill, LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT))
        page.addView(center, weighted())
        page.addView(bigButton("LÄGG PÅ", "avsluta samtalet", DANGER, 180) { call.disconnect() }, bottom())
      }
    }

    // Keep content clear of the status and navigation bars.
    return FrameLayout(this).apply {
      fitsSystemWindows = true
      setBackgroundColor(Color.WHITE)
      addView(page, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
    }
  }

  private fun answer(call: Call) {
    if (call.details.state == Call.STATE_RINGING) call.answer(VideoProfile.STATE_AUDIO_ONLY)
  }

  private fun duration(call: Call): String {
    val connected = call.details.connectTimeMillis
    if (connected <= 0) return "0:00"
    val secs = ((System.currentTimeMillis() - connected) / 1000).coerceAtLeast(0)
    return "%d:%02d".format(secs / 60, secs % 60)
  }

  private fun title(value: String) = text(value, 44f, bold, INK).apply {
    gravity = Gravity.CENTER
    setLineSpacing(0f, 1.1f)
  }

  private fun bigButton(label: String, hint: String?, color: Int, heightDp: Int, onClick: () -> Unit) =
    column(gap = 10).apply {
      gravity = Gravity.CENTER
      background = rounded(color, 22f)
      minimumHeight = px(heightDp)
      isClickable = true
      setOnClickListener { onClick() }
      addView(text(label, 44f, bold, Color.WHITE).apply { letterSpacing = 0.03f })
      hint?.let { addView(text(it, 19f, regular, Color.WHITE)) }
    }

  private fun column(gap: Int = 0) = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL
    if (gap > 0) {
      showDividers = LinearLayout.SHOW_DIVIDER_MIDDLE
      dividerDrawable = GradientDrawable().apply { setSize(1, px(gap)) }
    }
  }

  private fun text(value: String, size: Float, face: Typeface, color: Int) = TextView(this).apply {
    text = value
    textSize = size
    typeface = face
    setTextColor(color)
    gravity = Gravity.CENTER
  }

  private fun rounded(color: Int, radiusDp: Float) = GradientDrawable().apply {
    setColor(color)
    cornerRadius = radiusDp * dp
  }

  private fun weighted() = LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f).apply {
    setMargins(px(24), px(24), px(24), 0)
  }

  private fun bottom(gapBelow: Int = 24) = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply {
    setMargins(px(24), 0, px(24), px(gapBelow))
  }

  private fun px(value: Int) = (value * dp).toInt()

  // Bundled by the expo-font config plugin; falls back to the system font.
  private fun font(name: String): Typeface? = try {
    Typeface.createFromAsset(assets, "fonts/$name.ttf")
  } catch (e: Exception) {
    null
  }

  companion object {
    private val INK = Color.parseColor("#16181D")
    private val MUTED = Color.parseColor("#4A4F58")
    private val MUTED_PILL = Color.parseColor("#5B626E")
    private val SUCCESS = Color.parseColor("#0B6E3C")
    private val DANGER = Color.parseColor("#B3261E")

    // Same order as src/theme.ts tilePalettes, so each person keeps their colour.
    private val PALETTES = listOf(
      Color.parseColor("#C9DCEF") to Color.parseColor("#2C4F75"),
      Color.parseColor("#F4DCC3") to Color.parseColor("#7A4A1E"),
      Color.parseColor("#D2E7D1") to Color.parseColor("#2E5B38"),
      Color.parseColor("#E1D5ED") to Color.parseColor("#4B3A66"),
    )
    private val UNKNOWN_PALETTE = Color.parseColor("#E4E6EA") to Color.parseColor("#5B626E")
  }
}
