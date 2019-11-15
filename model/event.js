const config = require('../config/config.js')
const mysql = require('mysql')
const connection = mysql.createConnection(config.mysql_connection)

var event = {
    get_list: (req, res) => {
        console.log('event : get_list');

        let sql = ` SELECT event_id, project_id, achievement_id, reward_id, name, score
                    FROM event
                    WHERE (? IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', ? ,'%')))
                    ORDER BY modify_date DESC, create_date DESC
                    LIMIT ?, ?;`;

        let keyword = typeof req.query.keyword == 'undefined' ? null : req.query.keyword;
        let page_no = typeof req.query.page_no == 'undefined' ? 0 : parseInt(req.query.page_no);
        let itemStart = config.page_size * page_no;

        let data = [keyword, keyword, itemStart, config.page_size]

        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.send('ERROR!!');
                return;
            }

            connection.query('SELECT COUNT(*) as total_entries FROM event;', function (err2, results2) {
                if (err) {
                    console.error(err);
                    res.send('ERROR!!');
                    return;
                }

                var resultJson2 = JSON.stringify(results2);
                resultJson2 = JSON.parse(resultJson2);
                var total_entries = resultJson2[0].total_entries;

                var resultJson = JSON.stringify(results);
                resultJson = JSON.parse(resultJson);
                var apiResult = {}

                apiResult.meta = {
                    table: "event",
                    total_entries: total_entries,
                    page_total: Math.ceil(total_entries / config.page_size),
                    page_no: page_no
                }
                apiResult.data = resultJson;

                res.json(apiResult)
            });
        });
    },
    get_data: (req, res) => {
        console.log('event : get_data');

        let sql = ` SELECT event_id, project_id, achievement_id, reward_id, name, score
                    FROM event
                    WHERE event_id = ?`;

        let event_id = req.params.id;
        let data = [event_id]

        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.send('ERROR!!');
                return;
            }

            res.json(results[0])
        });

    },
    save_data: (req, res) => {
        console.log('event : save_data');

        let event_id = typeof req.params.id == 'undefined' ? null : req.params.id;

        if (event_id == null) {

            let sql = ` INSERT INTO event (project_id, achievement_id, reward_id, name, score, note, create_date, create_user_id) 
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`;

            let project_id = typeof req.body.project_id == 'undefined' ? null : req.body.project_id;
            let achievement_id = typeof req.body.achievement_id == 'undefined' ? null : req.body.achievement_id;
            let reward_id = typeof req.body.reward_id == 'undefined' ? null : req.body.reward_id;
            let name = req.body.name;
            let score = req.body.score;
            let note = typeof req.body.note == 'undefined' ? null : req.body.note;
            let create_user_id = req.body.create_user_id;
            let data = [project_id, achievement_id, reward_id, name, score, note, create_user_id]

            console.log(req.body);
            console.log(data);

            connection.query(sql, data, function (err, results, fields) {
                if (err) {
                    console.error(err);
                    res.send('ERROR!!');
                    return;
                }

                res.json({ 'event_id': results.insertId })
            });

        } else {

            let sql = ` UPDATE event
                        SET name = ?,
                            score = ?,
                            note = ?,
                            modify_date = NOW(),
                            modify_user_id = ?
                        WHERE event_id = ?`;

            let name = req.body.name;
            let score = req.body.score;
            let note = typeof req.body.note == 'undefined' ? null : req.body.note;
            let modify_user_id = req.body.modify_user_id;
            let data = [name, score, note, modify_user_id, event_id]

            //query the DB using prepared statement
            connection.query(sql, data, function (err, results, fields) {
                if (err) {
                    console.error(err);
                    res.send('ERROR!!');
                    return;
                }

                res.json({ 'status': true });

            });

        }
    },
    delete_data: (req, res) => {
        console.log('event : delete_data');
        //sql
        let sql = ` DELETE FROM event
                    WHERE event_id = ?`;

        let event_id = req.params.id;
        let data = [event_id]

        //query the DB using prepared statement
        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.send('ERROR!!');
                return;
            }

            res.json({ 'status': true })
        });
    }
}

module.exports.event = event;