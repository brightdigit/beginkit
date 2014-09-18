var async = require('async'),
    crypto = require('crypto'),
    db = require("../libs/sequelize"),
    QueryChainer = db.Sequelize.Utils.QueryChainer;

var User = db.user,
    App = db.app,
    Device = db.device,
    Session = db.session;

module.exports = function (include) {
  return {
    sessions: {
      params: {

      },
      actions: {
        index: function (req, res) {
          res.send('list ' + include("datetime"));
        },
        show: function (req, res) {
          res.send('show');
        },
        /**
         * @api {post} /session Login to the application.
         * @apiName Login
         * @apiGroup Session
         *
         * @apiParam {String} name Username.
         * @apiParam {String} password Password.
         * @apiParam {String} apiKey App api key.
         * @apiParam {String} [deviceKey] Device key.
         *
         * @apiSuccess {String} key Session key.
         * @apiSuccess {String} [deviceKey] Device key.
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *       "key": "dGVzdA==",
         *       "device": "dGVzdA=="
         *     }
         *
         * @apiSuccessExample Success-Response:
         *     HTTP/1.1 200 OK
         *     {
         *       "key": "dGVzdA=="
         *     }
         *
         * @apiError UnknownUsernameAndPassword The Username and Password combination has not been found.
         *
         * @apiErrorExample Error-Response:
         *     HTTP/1.1 404 Not Found
         *     {
         *       "error": "UnknownUsernameAndPassword"
         *     }
         *
         * @apiError UnknownApiKey The Application Api Key has not be found.
         *
         * @apiErrorExample Error-Response:
         *     HTTP/1.1 404 Not Found
         *     {
         *       "error": "UnknownApiKey"
         *     }
         */
        create: function (req, res) {
          // find user
          // find app
          // find or create device

          function findUser(requestBody) {
            function _(requestBody, cb) {
              User.findByLogin(requestBody.name, requestBody.password, cb.bind(undefined, undefined));
            }

            return _.bind(undefined, requestBody);
          }

          function findApp(requestBody) {
            function _(requestBody, cb) {
              App.findByKey(requestBody.apiKey).success(cb.bind(undefined, undefined));
            }

            return _.bind(undefined, requestBody);
          }

          function findDevice(request) {
            function _(request, cb) {
              Device.findByKey(request.body.deviceKey, request.headers['user-agent'], cb.bind(undefined, undefined));
            }

            return _.bind(undefined, request);
          }

          function beginSession(device, app, user, request, response) {
            Session.create({
              key: crypto.randomBytes(48),
              clientIpAddress: request.headers['x-forwarded-for'] || request.connection.remoteAddress
            }).success(function (session) {
              var chainer = new QueryChainer();
              chainer.add(session.setDevice(device));
              chainer.add(session.setApp(app));
              chainer.add(session.setUser(user));
              chainer.run().success(function (results) {
                response.status(201).send({
                  sessionKey: session.key.toString('base64'),
                  deviceKey: device.key.toString('base64')
                });
              });
            });
          }

          async.parallel({
            user: findUser(req.body),
            app: findApp(req.body),
            device: findDevice(req)
          }, function (error, result) {
            if (!result.user) {
              res.status(401).send({
                error: "Unknown username or password."
              });
            } else if (!result.app) {
              res.status(400).send({
                error: "Unknown application key."
              });
            } else {
              beginSession(result.device, result.app, result.user, request, res);
            }
          });
        },
        update: function (req, res) {
          res.send('update');
        },
        destroy: function (req, res) {
          res.send('destroy');
        }
      }
    }
  };
};