package se.basit.grammacall.call

import android.content.Context
import android.telephony.PhoneNumberUtils
import org.json.JSONArray
import org.json.JSONObject

data class SavedContact(
  val name: String,
  val spokenName: String?,
  val phone: String,
  val photoUri: String?,
  val position: Int,
)

// Call behaviour and contacts set from the settings screen. Stored natively so
// the InCallService and call screen work without the JS runtime being alive.
object CallSettings {
  private const val PREFS = "gramma_call"
  private const val KEY_WHITELIST = "whitelist"
  private const val KEY_SPEAKER = "speaker"
  private const val KEY_CONTACTS = "contacts"
  private const val COUNTRY_ISO = "se"

  // Numbers that get auto-answered. Empty when auto-answer is switched off.
  fun setWhitelist(context: Context, numbers: List<String>) {
    prefs(context).edit().putStringSet(KEY_WHITELIST, numbers.toSet()).apply()
  }

  fun whitelist(context: Context): Set<String> =
    prefs(context).getStringSet(KEY_WHITELIST, emptySet()) ?: emptySet()

  fun isWhitelisted(context: Context, number: String): Boolean =
    whitelist(context).any { sameNumber(it, number) }

  // Speaker + max volume for auto-answered and outgoing calls.
  fun setSpeaker(context: Context, enabled: Boolean) {
    prefs(context).edit().putBoolean(KEY_SPEAKER, enabled).apply()
  }

  fun speaker(context: Context): Boolean = prefs(context).getBoolean(KEY_SPEAKER, true)

  // Everyone on the home screen, so the call screen can show name and photo.
  fun setContacts(context: Context, contacts: List<SavedContact>) {
    val json = JSONArray()
    contacts.forEach {
      json.put(
        JSONObject()
          .put("name", it.name)
          .put("spokenName", it.spokenName)
          .put("phone", it.phone)
          .put("photoUri", it.photoUri)
          .put("position", it.position)
      )
    }
    prefs(context).edit().putString(KEY_CONTACTS, json.toString()).apply()
  }

  fun contactFor(context: Context, number: String?): SavedContact? {
    if (number.isNullOrBlank()) return null
    return try {
      val json = JSONArray(prefs(context).getString(KEY_CONTACTS, "[]"))
      (0 until json.length())
        .map { json.getJSONObject(it) }
        .firstOrNull { sameNumber(it.getString("phone"), number) }
        ?.let {
          SavedContact(
            name = it.getString("name"),
            spokenName = it.optString("spokenName").ifBlank { null },
            phone = it.getString("phone"),
            photoUri = it.optString("photoUri").ifBlank { null },
            position = it.optInt("position"),
          )
        }
    } catch (e: Exception) {
      null
    }
  }

  // Treats "+46790067247" and "0790067247" as the same number.
  private fun sameNumber(a: String, b: String) = PhoneNumberUtils.areSamePhoneNumber(a, b, COUNTRY_ISO)

  private fun prefs(context: Context) =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
