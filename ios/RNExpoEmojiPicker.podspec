Pod::Spec.new do |s|
  s.name           = 'RNExpoEmojiPicker'
  s.version        = '0.1.0'
  s.summary        = 'Native row rendering for rn-expo-emoji-picker'
  s.description    = 'Draws a full emoji picker row in a single UIView, replacing one Text view per glyph.'
  s.author         = 'Jass (Scanner Techs)'
  s.homepage       = 'https://github.com/JassiSingh08/rn-expo-emoji-picker'
  s.license        = { type: 'MIT' }
  # Must not exceed the app's deployment target (15.1 on Expo SDK 53/54) —
  # CocoaPods silently skips the module during autolinking otherwise.
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
