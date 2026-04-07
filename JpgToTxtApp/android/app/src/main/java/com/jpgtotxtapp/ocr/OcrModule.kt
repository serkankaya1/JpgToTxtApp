package com.jpgtotxtapp.ocr

import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.io.File

class OcrModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "OcrModule"

  @ReactMethod
  fun recognizeText(imageUriOrPath: String, promise: Promise) {
    try {
      val uri = toUri(imageUriOrPath)
      val inputImage = InputImage.fromFilePath(reactContext, uri)
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

      recognizer.process(inputImage)
        .addOnSuccessListener { text ->
          val blocksArray = Arguments.createArray()
          text.textBlocks.forEachIndexed { index, block ->
            val blockMap = Arguments.createMap()
            blockMap.putString("id", "${System.currentTimeMillis()}_$index")
            blockMap.putString("text", block.text)
            block.boundingBox?.let { box ->
              val bounds = Arguments.createMap()
              bounds.putInt("left", box.left)
              bounds.putInt("top", box.top)
              bounds.putInt("right", box.right)
              bounds.putInt("bottom", box.bottom)
              blockMap.putMap("bounds", bounds)
            }
            blocksArray.pushMap(blockMap)
          }
          promise.resolve(blocksArray)
          recognizer.close()
        }
        .addOnFailureListener { error ->
          recognizer.close()
          promise.reject("OCR_ERROR", error.message, error)
        }
    } catch (error: Exception) {
      promise.reject("OCR_INPUT_ERROR", error.message, error)
    }
  }

  private fun toUri(raw: String): Uri {
    if (raw.startsWith("content://") || raw.startsWith("file://")) {
      return Uri.parse(raw)
    }

    return Uri.fromFile(File(raw))
  }
}
