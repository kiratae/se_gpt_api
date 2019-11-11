const config = require('../config/config.js')
const mysql = require('mysql')
const connection = mysql.createConnection(config.mysql_connection)

var user = {
    get_list: (req, res) => {
        console.log('user : get_list');

        let sql = ` SELECT user_id, username, name, role_type_id, project_id
                    FROM user
                    WHERE (? IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', ? ,'%')))
                    LIMIT ?, ?`;

        let page_no = typeof req.body.page_no == 'undefined' ? 0 : parseInt(req.body.page_no);
        let keyword = typeof req.body.keyword == 'undefined' ? null : req.body.keyword;
        let data = [keyword, keyword, page_no, config.page_size]

        connection.query(sql, data, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.send('ERROR!!');
                return;
            }

            var resultJson = JSON.stringify(results);
            resultJson = JSON.parse(resultJson);
            var apiResult = {}

            apiResult.meta = {
                table: "user",
                total_entries: resultJson.length,
                page_total: Math.ceil(resultJson.length / config.page_size),
                page_no: page_no
            }
            apiResult.data = resultJson;

            res.json(apiResult)
        });
    },
    get_data: (req, res) => {
        console.log('user : get_data');

        let sql = ` SELECT user_id, username, name, role_type_id, project_id
                    FROM user
                    WHERE user_id = ?`;

        let user_id = req.params.id;
        let data = [user_id]

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
        console.log('user : save_data');

        let user_id = typeof req.params.id == 'undefined' ? null : req.params.id;

        if (user_id == null) {

            let sql = ` INSERT INTO user (username, password, name, role_type_id, project_id, create_date, create_user_id) 
                        VALUES (?, ?, ?, ?, ?, NOW(), ?)`;

            let username = req.body.username;
            let password = req.body.password;
            let name = req.body.name;
            let role_type_id = req.body.role_type_id;
            let project_id = typeof req.body.project_id == 'undefined' ? null : req.body.project_id;
            let create_user_id = req.body.user_id;
            let data = [username, password, name, role_type_id, project_id, create_user_id]

            connection.query(sql, data, function (err, results, fields) {
                if (err) {
                    console.error(err);
                    res.send('ERROR!!');
                    return;
                }

                res.json({ 'user_id': results.insertId })
            });

        } else {

            let sql = ` UPDATE user
                        SET username = ?,
                            password = ?,
                            name = ?,
                            role_type_id = ?,
                            project_id = ?,
                            modify_date = NOW(),
                            modify_user_id = ?
                        WHERE event_id = ?`;

            let username = req.body.username;
            let password = req.body.password;
            let name = req.body.name;
            let role_type_id = req.body.role_type_id;
            let project_id = typeof req.body.project_id == 'undefined' ? null : req.body.project_id;
            let modify_user_id = req.body.user_id;
            let data = [username, password, name, role_type_id, project_id, modify_user_id, user_id]

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
        console.log('user : delete_data');
        //sql
        let sql = ` DELETE FROM user
                    WHERE user_id = ?`;

        let user_id = req.params.id;
        let data = [user_id]

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

module.exports.user = user;