package se.basit.grammacall.call

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

// Arabic announcement of who is calling. The UI is Swedish; she only
// understands Arabic.
object CallSpeech : TextToSpeech.OnInitListener {
  private var tts: TextToSpeech? = null
  private var ready = false
  private var pending: String? = null

  fun init(context: Context) {
    if (tts == null) tts = TextToSpeech(context.applicationContext, this)
  }

  override fun onInit(status: Int) {
    ready = status == TextToSpeech.SUCCESS
    if (!ready) {
      Log.w(GrammaInCallService.TAG, "TTS init failed: $status")
      return
    }
    val result = tts?.setLanguage(Locale("ar"))
    Log.i(GrammaInCallService.TAG, "TTS ready, arabic=$result")
    pending?.let { speak(it) }
    pending = null
  }

  fun announceCaller(contact: SavedContact) {
    speak("مكالمة من ${contact.spokenName ?: contact.name}")
  }

  fun stop() {
    pending = null
    tts?.stop()
  }

  private fun speak(text: String) {
    if (!ready) {
      pending = text
      return
    }
    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "gramma-caller")
  }
}
