var member = require('./member.lib.js');
var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');

var writeRecord = JSON.parse('{"paper_id":136,"beginTime":"2012-7-30 16:10:50","endTime":"2012-7-30 16:10:59","item":[{"word_id":1817,"right":0,"answer":"test","sort":33},{"word_id":1818,"right":0,"answer":"test","sort":60},{"word_id":1819,"right":0,"answer":"test","sort":72},{"word_id":1820,"right":0,"answer":"test","sort":39},{"word_id":1821,"right":0,"answer":"test","sort":3},{"word_id":1822,"right":0,"answer":"test","sort":75},{"word_id":1823,"right":0,"answer":"test","sort":65},{"word_id":1824,"right":0,"answer":"test","sort":7},{"word_id":1825,"right":0,"answer":"test","sort":45},{"word_id":1826,"right":0,"answer":"test","sort":43},{"word_id":1827,"right":0,"answer":"test","sort":51},{"word_id":1828,"right":0,"answer":"test","sort":52},{"word_id":1829,"right":0,"answer":"test","sort":30},{"word_id":1830,"right":0,"answer":"test","sort":29},{"word_id":1831,"right":0,"answer":"test","sort":71},{"word_id":1832,"right":0,"answer":"test","sort":12},{"word_id":1833,"right":0,"answer":"test","sort":26},{"word_id":1834,"right":0,"answer":"test","sort":35},{"word_id":1835,"right":0,"answer":"test","sort":13},{"word_id":1836,"right":0,"answer":"test","sort":46},{"word_id":1837,"right":0,"answer":"test","sort":68},{"word_id":1838,"right":0,"answer":"test","sort":25},{"word_id":1839,"right":0,"answer":"test","sort":42},{"word_id":1840,"right":0,"answer":"test","sort":23},{"word_id":1841,"right":0,"answer":"test","sort":76},{"word_id":1842,"right":0,"answer":"test","sort":41},{"word_id":1843,"right":0,"answer":"test","sort":32},{"word_id":1844,"right":0,"answer":"test","sort":2},{"word_id":1845,"right":0,"answer":"test","sort":38},{"word_id":1846,"right":0,"answer":"test","sort":53},{"word_id":1847,"right":0,"answer":"test","sort":66},{"word_id":1848,"right":0,"answer":"test","sort":10},{"word_id":1849,"right":0,"answer":"test","sort":11},{"word_id":1850,"right":0,"answer":"test","sort":36},{"word_id":1851,"right":0,"answer":"test","sort":15},{"word_id":1852,"right":0,"answer":"test","sort":8},{"word_id":1853,"right":0,"answer":"test","sort":54},{"word_id":1854,"right":0,"answer":"test","sort":62},{"word_id":1855,"right":0,"answer":"test","sort":34},{"word_id":1856,"right":0,"answer":"test","sort":14},{"word_id":1857,"right":0,"answer":"test","sort":31},{"word_id":1858,"right":0,"answer":"test","sort":24},{"word_id":1859,"right":0,"answer":"test","sort":17},{"word_id":1860,"right":0,"answer":"test","sort":69},{"word_id":1861,"right":0,"answer":"test","sort":47},{"word_id":1862,"right":0,"answer":"test","sort":40},{"word_id":1863,"right":0,"answer":"test","sort":74},{"word_id":1864,"right":0,"answer":"test","sort":6},{"word_id":1865,"right":0,"answer":"test","sort":55},{"word_id":1866,"right":0,"answer":"test","sort":27},{"word_id":1867,"right":0,"answer":"test","sort":22},{"word_id":1868,"right":0,"answer":"test","sort":50},{"word_id":1869,"right":0,"answer":"test","sort":59},{"word_id":1870,"right":0,"answer":"test","sort":49},{"word_id":1871,"right":0,"answer":"test","sort":1},{"word_id":1872,"right":0,"answer":"test","sort":61},{"word_id":1873,"right":0,"answer":"test","sort":4},{"word_id":1874,"right":0,"answer":"test","sort":44},{"word_id":1875,"right":0,"answer":"test","sort":16},{"word_id":1876,"right":0,"answer":"test","sort":37},{"word_id":1877,"right":0,"answer":"test","sort":28},{"word_id":1878,"right":0,"answer":"test","sort":21},{"word_id":1879,"right":0,"answer":"test","sort":20},{"word_id":1880,"right":0,"answer":"test","sort":70},{"word_id":1881,"right":0,"answer":"test","sort":18},{"word_id":1882,"right":0,"answer":"test","sort":19},{"word_id":1883,"right":0,"answer":"test","sort":67},{"word_id":1884,"right":0,"answer":"test","sort":5},{"word_id":1885,"right":0,"answer":"test","sort":57},{"word_id":1886,"right":0,"answer":"test","sort":48},{"word_id":1887,"right":0,"answer":"test","sort":58},{"word_id":1888,"right":0,"answer":"test","sort":9},{"word_id":1889,"right":0,"answer":"test","sort":56},{"word_id":1890,"right":0,"answer":"test","sort":63},{"word_id":1891,"right":0,"answer":"test","sort":77},{"word_id":1892,"right":0,"answer":"test","sort":73},{"word_id":1893,"right":0,"answer":"test","sort":0},{"word_id":1894,"right":0,"answer":"test","sort":64}]}');

function syncWithCommited(sid, theMember, wrs, ewrs) {
    describe('#Sync write records with COMMITED data', function() {        
        var json = {writeRecord:{}, errorWriteRecord:{}};
        json.writeRecord.commited = wrs.map(function(wr) { return wr._id; });
        json.errorWriteRecord.commited = ewrs.map(function(ewr) { return ewr._id; });
        it('Should success sync WITHOUT any response data of '+theMember.username, function(done) {
            member.put('/write_records', json, sid)
            .end(function(res) {
                res.statusCode.should.equal(204);
                done();
            });
        });
        
        it('Should success sync WITH all of possible data of '+theMember.username, function(done) {
            json.writeRecord.uncommit = [];
            json.errorWriteRecord.uncommit = [];
            for(var i = 1; i <= 2; i++){
                var wr = {
                    lid: i,
                    data: writeRecord
                };
                json.writeRecord.uncommit.push(wr);
                if(wrs[i]) {
                    var ewr = {
                        lid:i,
                        data: {
                            record_id:wrs[i]._id,
                            beginTime:wrs[i].beginTime,
                            endTime:wrs[i].endTime,
                            item:wrs[i].item
                        }
                    }
                    json.errorWriteRecord.uncommit.push(ewr);
                }
            }
            json.writeRecord.commited = json.writeRecord.commited.filter(function(_id, _i, _array) { 
                return (_i%2 === 0);
            });
            json.errorWriteRecord.commited = json.errorWriteRecord.commited.filter(function(_id, _i, _array) { 
                return (_i%2 === 0);
            });
            member.put('/write_records', json, sid)
            .end(function(res) {
                res.statusCode.should.equal(200);
                res.should.be.json;
                res.body.writeRecord.should.have.property('created');
                if(wrs[0]) {
                    res.body.errorWriteRecord.should.have.property('created');
                } else {
                    res.body.should.not.have.property('errorWriteRecord');
                }
                done();
            });
        });
    })
}

function sync(sid, theMember) {
    describe('#Sync write records without COMMITED data', function() {
        it('Should success sync WITHOUT any upload write and error redo records of '+theMember.username, function(done) {
            member.put('/write_records', '', sid)
            .end(function(res) {
                if(res.statusCode === 200) {
                    res.should.be.json;
                    res.body.should.not.have.property('created');
                } else res.statusCode.should.equal(204);
                done();
                var wrs = res.body.writeRecord.dataset||[];
                var ewrs = res.body.errorWriteRecord.dataset||[];
                syncWithCommited(sid, theMember, wrs, ewrs);
            });
        });
    })
};

describe('#Write Record Sync Test', function() {
    it('Should Login as member', function(done) {
        member.afterLogin(function(sid, theMember) {
            done();
            sync(sid, theMember);
        });
    })
});