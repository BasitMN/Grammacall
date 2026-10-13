package se.basit.mostercall

import android.content.Context
import android.content.Intent
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

// We are the launcher, so pressing home while the app is already in front
// only delivers a new HOME intent — no app state change. Forward it to JS so
// settings lock and a pending countdown is cancelled.
class MosterCallPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> =
    listOf(object : ReactActivityLifecycleListener {
      override fun onNewIntent(intent: Intent?): Boolean {
        if (intent?.hasCategory(Intent.CATEGORY_HOME) == true) MosterCallModule.homePressed()
        return false
      }
    })
}
