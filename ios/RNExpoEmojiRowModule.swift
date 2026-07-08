import ExpoModulesCore
import UIKit

/**
 * One UIView per picker row: draws every glyph with UIKit string drawing
 * (CoreText underneath) instead of mounting a Text view per emoji. Touch
 * handling stays on the JS side (the row's Pressable), so this view is
 * purely visual.
 */
class EmojiRowView: ExpoView {
  var glyphs: [String] = [] { didSet { setNeedsDisplay() } }
  var fontSize: CGFloat = 28 { didSet { setNeedsDisplay() } }
  var columns: Int = 8 { didSet { setNeedsDisplay() } }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isOpaque = false
    backgroundColor = .clear
    contentMode = .redraw
  }

  override func draw(_ rect: CGRect) {
    guard columns > 0, !glyphs.isEmpty, bounds.width > 0 else { return }
    let slot = bounds.width / CGFloat(columns)
    let attributes: [NSAttributedString.Key: Any] = [
      .font: UIFont.systemFont(ofSize: fontSize)
    ]
    // Match the JS rows: RN reverses flex rows under RTL, and the JS hit
    // test flips the column index, so the drawing must flip too.
    let rtl = effectiveUserInterfaceLayoutDirection == .rightToLeft
    for (index, glyph) in glyphs.enumerated() {
      let column = rtl ? columns - 1 - index : index
      let text = glyph as NSString
      let size = text.size(withAttributes: attributes)
      let origin = CGPoint(
        x: CGFloat(column) * slot + (slot - size.width) / 2,
        y: (bounds.height - size.height) / 2
      )
      text.draw(at: origin, withAttributes: attributes)
    }
  }
}

public class RNExpoEmojiRowModule: Module {
  public func definition() -> ModuleDefinition {
    Name("RNExpoEmojiRow")

    View(EmojiRowView.self) {
      Prop("glyphs") { (view: EmojiRowView, glyphs: [String]) in
        view.glyphs = glyphs
      }
      Prop("fontSize") { (view: EmojiRowView, size: Double) in
        view.fontSize = CGFloat(size)
      }
      Prop("columns") { (view: EmojiRowView, columns: Int) in
        view.columns = columns
      }
    }
  }
}
