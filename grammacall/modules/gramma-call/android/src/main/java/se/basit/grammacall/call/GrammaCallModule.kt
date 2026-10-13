package se.basit.grammacall.call

import android.Manifest
import android.annotation.SuppressLint
import android.app.role.RoleManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.telecom.TelecomManager
import android.util.Log
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GrammaCallModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val roleManager
    get() = context.getSystemService(RoleManager::class.java)

  override fun definition() = ModuleDefinition {
    Name("GrammaCall")

    Events("onHomePressed")

    OnCreate { instance = this@GrammaCallModule }
    OnDestroy { if (instance == this@GrammaCallModule) instance = null }

    Function("getDeviceInfo") {
      mapOf(
        "manufacturer" to Build.MANUFACTURER,
        "model" to Build.MODEL,
        "release" to Build.VERSION.RELEASE,
        "sdkInt" to Build.VERSION.SDK_INT
      )
    }

    Function("setWhitelist") { numbers: List<String> ->
      CallSettings.setWhitelist(context, numbers)
    }

    Function("getWhitelist") {
      CallSettings.whitelist(context).toList()
    }

    Function("setSpeaker") { enabled: Boolean ->
      CallSettings.setSpeaker(context, enabled)
    }

    Function("setContacts") { contacts: List<Map<String, Any?>> ->
      CallSettings.setContacts(context, contacts.map {
        SavedContact(
          name = it["name"] as? String ?: "",
          spokenName = it["spokenName"] as? String,
          phone = it["phone"] as? String ?: "",
          photoUri = it["photoUri"] as? String,
          position = (it["position"] as? Number)?.toInt() ?: 0,
        )
      })
    }

    Function("hasDialerRole") {
      roleManager.isRoleHeld(RoleManager.ROLE_DIALER)
    }

    // Opens the system "default phone app" dialog. The result is read back
    // with hasDialerRole() when the app returns to the foreground.
    Function("requestDialerRole") {
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER)
      activity.startActivityForResult(intent, REQUEST_DIALER_ROLE)
    }

    // Launcher role: the home button always leads back to her tiles.
    Function("hasHomeRole") {
      roleManager.isRoleHeld(RoleManager.ROLE_HOME)
    }

    Function("requestHomeRole") {
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      activity.startActivityForResult(roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME), REQUEST_HOME_ROLE)
    }

    // For the nephew: pick another home screen to get out of the app.
    Function("openHomeSettings") {
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      activity.startActivity(Intent(Settings.ACTION_HOME_SETTINGS))
    }

    Function("isIgnoringBatteryOptimizations") {
      context.getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(context.packageName)
    }

    @SuppressLint("BatteryLife")
    Function("requestIgnoreBatteryOptimizations") {
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      activity.startActivity(
        Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${context.packageName}"))
      )
    }

    Function("setRoleWarning") { show: Boolean ->
      RoleWarning.update(context, show)
    }

    // Places a normal cellular call straight away; no dialer screen in between.
    Function("placeCall") { number: String ->
      if (context.checkSelfPermission(Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
        throw CodedException("ERR_CALL_PERMISSION", "CALL_PHONE not granted", null)
      }
      @SuppressLint("MissingPermission")
      context.getSystemService(TelecomManager::class.java)
        .placeCall(Uri.fromParts("tel", number, null), Bundle())
      Log.i(GrammaInCallService.TAG, "placeCall($number)")
    }
  }

  companion object {
    private const val REQUEST_DIALER_ROLE = 4712
    private const val REQUEST_HOME_ROLE = 4713

    private var instance: GrammaCallModule? = null

    // Called from GrammaCallPackage when the home button is pressed in-app.
    fun homePressed() {
      try {
        instance?.sendEvent("onHomePressed", emptyMap<String, Any>())
      } catch (e: Exception) {
        Log.e(GrammaInCallService.TAG, "could not forward home press", e)
      }
    }
  }
}
