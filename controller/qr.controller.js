const { v4: uuidv4 } = require('uuid');
const QrCode = require('../model/qrCode');

exports.createQr = async (req, res) => {
  try {
    const qrId = uuidv4();

    const qr = new QrCode({ qrId });
    await qr.save();

    res.status(201).json({ qrId });
  } catch (err) {
    res.status(500).json({ message: 'QR creation failed' });
  }
};

exports.qrList = async (req, res) => {
  try {

    const qrList = await QrCode
      .find()
      .sort({ createdAt: -1 });

    res.status(200).json(qrList);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch QR list'
    });

  }

};


exports.checkQr = async (req, res) => {
  const { qrId } = req.params;

  console.log(qrId)

  try {
    const qr = await QrCode.findOne({ qrId });

    if (!qr) {
      return res.status(404).json({ message: 'Invalid QR' , status: qr.status  });
    }

    res.json({
      qrId: qr.qrId,
      status: qr.status 
    });

  } catch (err) {
    res.status(500).json({ message: 'Error checking QR' });
  }
};