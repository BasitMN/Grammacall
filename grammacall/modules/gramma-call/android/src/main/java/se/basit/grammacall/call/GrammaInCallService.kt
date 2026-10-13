package se.basit.grammacall.call

import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.OutcomeReceiver
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.CallEndpoint
import android.telecom.CallEndpointException
import android.telecom.InCallService
import android.telecom.VideoProfile
import android.util.Log

// Bound by Telecom for every call while we hold ROLE_DIALER. Owns the call UI,
// so it can answer, hang up and route audio through official APIs.
//
// We are her only phone app: an uncaught exception here means calls cannot be
// shown or answered. Every entry point is therefore wrapped in safely().
class GrammaInCallService : InCallService() {
  private val handler = Handler(Looper.getMainLooper())
  private var endpoints: List<CallEndpoint> = emptyList()

  override fun onCreate() {
    super.onCreate()
    instance = this
    safely("init speech") { CallSpeech.init(this) }
  }

  override fun onDestroy() {
    instance = null
    super.onDestroy()
  }

  override fun onCallAdded(call: Call) {
    activeCalls.add(call)
    safely("register callback") { call.registerCallback(callback) }

    safely("onCallAdded") {
      val number = call.details.handle?.schemeSpecificPart
      val incoming = call.details.callDirection == Call.Details.DIRECTION_INCOMING
      val whitelisted = incoming && number != null && CallSettings.isWhitelisted(this, number)
      Log.i(TAG, "onCallAdded state=${call.details.state} incoming=$incoming number=$number whitelisted=$whitelisted")

      if (whitelisted && call.details.state == Call.STATE_RINGING) {
        autoAnswerAt[call] = System.currentTimeMillis() + ANSWER_DELAY_MS
        CallSettings.contactFor(this, number)?.let { CallSpeech.announceCaller(it) }
        handler.postDelayed({
          safely("auto-answer") {
            if (call.details.state == Call.STATE_RINGING) {
              Log.i(TAG, "auto-answering")
              call.answer(VideoProfile.STATE_AUDIO_ONLY)
            }
          }
        }, ANSWER_DELAY_MS)
      }
    }

    safely("start CallActivity") {
      startActivity(Intent(this, CallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
    notifyChanged()
  }

  override fun onCallRemoved(call: Call) {
    Log.i(TAG, "onCallRemoved")
    safely("unregister callback") { call.unregisterCallback(callback) }
    activeCalls.remove(call)
    autoAnswerAt.remove(call)
    notifyChanged()
    if (activeCalls.isEmpty()) {
      safely("stop speech") { CallSpeech.stop() }
      bringAppToFront()
    }
  }

  // "The app must come back to the home screen by itself after a call ends."
  private fun bringAppToFront() = safely("bring app to front") {
    val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return@safely
    launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
    startActivity(launch)
  }

  override fun onAvailableCallEndpointsChanged(available: List<CallEndpoint>) {
    endpoints = available
  }

  override fun onCallEndpointChanged(endpoint: CallEndpoint) {
    speakerOn = endpoint.endpointType == CallEndpoint.TYPE_SPEAKER
    Log.i(TAG, "endpoint now ${endpoint.endpointType} (${endpoint.endpointName})")
    notifyChanged()
  }

  // Android 12–13 report the route here instead of onCallEndpointChanged.
  @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
  override fun onCallAudioStateChanged(audioState: CallAudioState) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return
    speakerOn = audioState.route == CallAudioState.ROUTE_SPEAKER
    Log.i(TAG, "audio route now ${audioState.route}")
    notifyChanged()
  }

  fun setSpeaker(on: Boolean) = safely("setSpeaker") {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      // Pre-Android 14 API. Untested: only verified on Android 16.
      @Suppress("DEPRECATION")
      setAudioRoute(if (on) CallAudioState.ROUTE_SPEAKER else CallAudioState.ROUTE_EARPIECE)
      return@safely
    }
    val wanted = if (on) CallEndpoint.TYPE_SPEAKER else CallEndpoint.TYPE_EARPIECE
    val endpoint = endpoints.firstOrNull { it.endpointType == wanted }
    if (endpoint == null) {
      Log.w(TAG, "no endpoint of type $wanted in ${endpoints.map { it.endpointType }}")
      return@safely
    }
    requestCallEndpointChange(endpoint, mainExecutor, object : OutcomeReceiver<Void, CallEndpointException> {
      override fun onResult(result: Void?) {
        Log.i(TAG, "endpoint change to $wanted ok")
      }

      override fun onError(error: CallEndpointException) {
        Log.e(TAG, "endpoint change to $wanted failed: code=${error.code}", error)
      }
    })
  }

  private fun speakerAndMaxVolume() = safely("speaker + volume") {
    setSpeaker(true)
    val audio = getSystemService(AudioManager::class.java)
    val max = audio.getStreamMaxVolume(AudioManager.STREAM_VOICE_CALL)
    audio.setStreamVolume(AudioManager.STREAM_VOICE_CALL, max, 0)
    Log.i(TAG, "volume ${audio.getStreamVolume(AudioManager.STREAM_VOICE_CALL)}/$max")
  }

  private val callback = object : Call.Callback() {
    override fun onStateChanged(call: Call, state: Int) {
      safely("onStateChanged") {
        Log.i(TAG, "state -> $state")
        if (state == Call.STATE_ACTIVE) {
          CallSpeech.stop()
          // Every call she is in goes to speaker: auto-answered, answered by hand, or outgoing.
          if (CallSettings.speaker(this@GrammaInCallService)) {
            // Telecom settles its own route right after ACTIVE; override after that.
            handler.postDelayed({ speakerAndMaxVolume() }, SPEAKER_DELAY_MS)
          }
        }
      }
      notifyChanged()
    }
  }

  companion object {
    const val TAG = "GrammaCall"
    private const val ANSWER_DELAY_MS = 2000L
    private const val SPEAKER_DELAY_MS = 500L

    var instance: GrammaInCallService? = null
      private set
    val activeCalls = mutableListOf<Call>()
    // Calls that will be (or were) auto-answered, and when.
    val autoAnswerAt = mutableMapOf<Call, Long>()
    var speakerOn: Boolean = false
      private set

    private val listeners = mutableListOf<() -> Unit>()
    fun addListener(listener: () -> Unit) = listeners.add(listener)
    fun removeListener(listener: () -> Unit) = listeners.remove(listener)
    private fun notifyChanged() = listeners.toList().forEach { safely("listener") { it() } }

    fun safely(what: String, block: () -> Unit) {
      try {
        block()
      } catch (e: Throwable) {
        // Throwable, not Exception: a missing API on an older Android version
        // throws NoSuchMethodError, which must not take down call handling.
        Log.e(TAG, "$what failed", e)
      }
    }
  }
}
