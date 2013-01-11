var SimpleDO = require('../lib/simpleDO')
var config = require('config.js').config
var logger = require('log4js').getLogger('Word Model')
var PartOfSpeech = require('./partOfSpeech')

function Word() {
	this.options.schema = 'gs_word'
	this.options.field = ['_id', 'word', 'audio', 'createtime AS createTime', 'type']
	this.options.order = {_id:'ASC'}
	this.relations = [new PartOfSpeech()]
}

Word.prototype = new SimpleDO()
Word.prototype.makeup = function(partOfSpeeches, next) {
	this.recordset.forEach(function(word) {
    word.audio = "http://"+config.host+":"+config.port+config.files.audio.base+word.audio;
    word.partOfSpeech = [];
    partOfSpeeches.some(function(partOfSpeech, index, arr) {//filter the part of speech for this word
      if(partOfSpeech.word_id === word._id) {
        delete partOfSpeech.word_id;
        //for fix sick database 
        partOfSpeech._id = partOfSpeech.id;
        delete partOfSpeech.id;
        word.partOfSpeech.push(partOfSpeech);
        //words and part of speech are all sort by word_id, so this operation can decrease loop times.
        delete arr[index];
        return false;
      } else { //no more part of speech for this word
        return true;
      }
    });
  });
	next(null, this.recordset)
}

exports = module.exports = Word