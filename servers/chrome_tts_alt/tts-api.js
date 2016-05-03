(function (exports) {

function TtsApi() {
  this.settings = {
    lang: 'en-US'
  }
  this.sounds = {}
  this.soundQueue = []
}

TtsApi.prototype.execute = function (args) {
  switch (args[0]) {
    case 'tts_lang':
      this.setLang(args[1])
      return 'Lang set'
    case 'tts_say':
      this.speak(args.slice(1).join(' '))
      return 'Speaking'
    case 'q':
      this.enqueueSpeech(args.slice(1).join(' '))
      return 'Enqueued speech'
    case 'a':
      this.enqueueSound(args[1])
      return 'Enqueued sound'
    default:
      return 'Unknown command'
  }
}

TtsApi.prototype.setLang = function (code) {
  this.settings.lang = code
}

TtsApi.prototype.speak = function (msg) {
  chrome.tts.stop()
  chrome.tts.speak(msg, { lang: this.settings.lang })
}

TtsApi.prototype.enqueueSpeech = function (msg) {
  chrome.tts.speak(msg, {
    lang: this.settings.lang,
    enqueue: true
  })
}

TtsApi.prototype.play = function (file) {
  var sound = this._loadSound(file)
  sound.currentTime = 0
  sound.play()
}

TtsApi.prototype.enqueueSound = function (file) {
  var sound = this._loadSound(file)
  this.soundQueue.push(sound)
  this._playQueue()
}

TtsApi.prototype._loadSound = function (file) {
  var matches = file.match(/.*\/emacspeak\/(sounds\/.*)/)

  if (!matches) {
    throw new Error('Unexpected file ' + file)
  }

  if (!this.sounds[file]) {
    this.sounds[file] = new Audio()
    this.sounds[file].src = matches.pop()
  }

  return this.sounds[file]
}

TtsApi.prototype._playQueue = function () {
  if (this.soundQueue.length === 0 || !this.soundQueue[0].paused) {
    return
  }

  var self = this

  this.soundQueue[0].addEventListener('ended', function () {
    self.soundQueue = self.soundQueue.slice(1)
    self._playQueue()
  }, this)

  this.soundQueue[0].play()
}

exports.TtsApi = TtsApi

})(window)
