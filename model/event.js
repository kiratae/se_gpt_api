const config = require('../config/config.js')
const mysql = require('mysql')
const connection = mysql.createConnection(config.mysql_connection)

var event = {
    get_list: (req, res) => {
        console.log('event : get_list');
        //sql
        let sql = ` SELECT se_id, se_name, se_details, se_values
                    FROM scrum_events
                    WHERE (? IS NULL OR LOWER(se_name) LIKE LOWER(CONCAT('%', ? ,'%')))
                    LIMIT ?, ?`;

        let page_no = typeof req.body.page_no == 'undefined' ? 0 : parseInt(req.body.page_no);
        let keyword = typeof req.body.keyword == 'undefined' ? null : req.body.keyword;
        let data = [keyword, keyword, page_no, config.page_size]

        //query the DB using prepared statement
        connection.query(sql, data, function (err, results, fields) {
            //if error, print blank results
            if (err) {
                console.log(err);
                res.json({ 'error': err })
            }

            var resultJson = JSON.stringify(results);
            resultJson = JSON.parse(resultJson);
            var apiResult = {}

            apiResult.meta = {
                table: "scrum_events",
                type: "collection",
                total: 1,
                page_no: page_no,
                total_entries: resultJson.length
            }
            apiResult.data = resultJson;

            res.json(apiResult)
        });
    },
    get_data: (req, res) => {
        console.log('event : get_data');
        //sql
        let sql = ` SELECT se_id, se_name, se_details, se_values
                    FROM scrum_events
                    WHERE se_id = ?`;

        let se_id = req.params.id;
        let data = [se_id]

        //query the DB using prepared statement
        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.json({ 'error': err })
            }

            res.json(results[0])
        });
    },
    save_data: (req, res) => {
        console.log('event : save_data');

        let se_id = typeof req.params.id == 'undefined' ? null : req.params.id;

        if (se_id == null) {
            let sql = ` INSERT INTO scrum_events (se_name, se_details, se_values) 
                        VALUES (?, ?, ?)`;

            let se_name = req.body.se_name;
            let se_details = req.body.se_details;
            let se_values = req.body.se_values;
            let data = [se_name, se_details, se_values]

            //query the DB using prepared statement
            connection.query(sql, data, function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.json({ 'error': err })
                }
                res.json({ 'se_id': results.insertId })
            });
        } else {
            let sql = ` UPDATE scrum_events
                        SET se_name = ?,
                            se_details = ?,
                            se_values = ?
                        WHERE se_id = ?`;

            let se_name = req.body.se_name;
            let se_details = req.body.se_details;
            let se_values = req.body.se_values;
            let data = [se_name, se_details, se_values, se_id]

            //query the DB using prepared statement
            connection.query(sql, data, function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.json({ 'error': err });
                }

                res.json({ 'status': true });

            });
        }
    },
    delete_data: (req, res) => {
        console.log('event : delete_data');
        //sql
        let sql = ` DELETE FROM scrum_events
                    WHERE se_id = ?`;

        let se_id = req.params.id;
        let data = [se_id]

        //query the DB using prepared statement
        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.json({ 'error': err })
            }

            res.json({ 'status': true })
        });
    }
}

module.exports.event = event