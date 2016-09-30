var express = require('express');
var router = express.Router();
var CustomChartsHandler = require('../handlers/customChart');

module.exports = function (models) {
    var handler = new CustomChartsHandler(models);

    router.get('/', handler.restoreCharts);
    router.post('/', handler.createCharts);
    router.delete('/', handler.deleteCharts);

    return router;
};
