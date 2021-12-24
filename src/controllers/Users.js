const hs = require("http-status");
const uuid = require("uuid");
const { list, insert, findOne, modify } = require("../services/Users");
const { passwordToHash, generateJWTAccessToken, generateJWTRefreshToken } = require("../scripts/utils/helper");
const eventEmitter = require("../scripts/events/eventEmitter");

const index = (req, res) => {
  list()
    .then((userList) => {
      if (!userList) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: "Sorun var.." });
      res.status(hs.OK).send(userList);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((createdUser) => {
      if (!createdUser) res.status(hs.INTERNAL_SERVER_ERROR).send({ error: "Sorun var.." });
      res.status(hs.OK).send(createdUser);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  findOne(req.body)
    .then((user) => {
      if (!user) return res.status(hs.NOT_FOUND).send({ message: "Böyle bir kullanıcı bulunmamaktadır." });
      user = {
        ...user.toObject(),
        tokens: {
          access_token: generateJWTAccessToken(user),
          refresh_token: generateJWTRefreshToken(user),
        },
      };
      delete user.password;
      res.status(hs.OK).send(user);
    })
    .catch((e) => res.status(hs.INTERNAL_SERVER_ERROR).send(e));
};

//! ÖDEV Video Üzerinden izleyip implemente edilecek.
// https://www.youtube.com/watch?v=pMi3PiITsMc
const resetPassword = (req, res) => {
  const newPassword = uuid.v4().split("-")[0] || `usr-${new Date().getTime()}`;
  console.log(newPassword);
  modify({ email: req.body.email }, { password: passwordToHash(newPassword) }).then(updatedUser => {
    if(!updatedUser) return res.status(hs.NOT_FOUND).send({ error: "Böyle bir kullanıcı bulunmamaktadır." });
    eventEmitter.emit("send-email", {
      to: updatedUser.email, // list of receivers
      subject: "Şifre Sıfırlama", // Subject line
      html: `Talebiniz üzerine şifre sıfırlama işleminiz gerçekleşmiştir. </br> Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın! </br> Yeni şifreniz <b>${newPassword}</b>`,
    });
    res.status(hs.OK).send({ message: "Şifreniz sıfırlama işlemi için sisteme kayıtlı e-posta adresinize gereken bilgileri gönderdik" });
  }).catch(() => {
    res.status(hs.INTERNAL_SERVER_ERROR).send({ error: "Şifre resetleme sırasında bir hata oluştu" });
  })
};

module.exports = {
  index,
  create,
  login,
  resetPassword,
};
