const QrCode = require('../model/qrCode');
const User = require('../model/user');


const transporter = require('../helper/mail');
exports.notifyOwner = async (req, res) => {
  try {

    const { qrId } = req.body.position;
    const { latitude, longitude } = req.body.position;

    const qr = await QrCode.findOne({ qrId });

    if (!qr) {
      return res.status(404).json({
        message: 'QR not found'
      });
    }

    const user = await User.findById(qr.user);

    if (!user) {
      return res.status(404).json({
        message: 'Vehicle owner not found'
      });
    }

    const locationLink =
      `https://maps.google.com/?q=${latitude},${longitude}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Vehicle Movement Request',
      html: `
        <h2>Vehicle Movement Request</h2>

        <p>
          Your vehicle appears to be blocking another vehicle.
        </p>

        <p>
          Please move your vehicle if possible.
        </p>

        <p>
          Requester's Location:
          <a href="${locationLink}">
            Open in Google Maps
          </a>
        </p>

        <br><br>

        <b>From,</b>
        <p>Vahan-App</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.response);

    return res.json({
      success: true,
      email: user.email,
      message: 'Notification sent successfully'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Failed to send notification'
    });
  }
};