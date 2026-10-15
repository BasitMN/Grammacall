package se.basit.grammacall.call

import android.content.Context
import android.media.AudioManager
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

// Arabic announcement of who is calling. The UI is Swedish; she only
// understands Arabic.
object CallSpeech : TextToSpeech.OnInitListener {
  private var tts: TextToSpeech? = null
  private var appContext: Context? = null
  private var ready = false
  private var pending: String? = null

  fun init(context: Context) {
    appContext = context.applicationContext
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
    appContext?.let { maximizeVolume(it) }
    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "gramma-caller")
  }

  // TTS plays on the media stream. Its volume may have been turned down (or
  // never up) by anyone; she must always hear who is calling or being called.
  fun maximizeVolume(context: Context) {
    try {
      val audio = context.getSystemService(AudioManager::class.java)
      val max = audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
      audio.setStreamVolume(AudioManager.STREAM_MUSIC, max, 0)
    } catch (e: Exception) {
      Log.e(GrammaInCallService.TAG, "could not raise speech volume", e)
    }
  }
}
