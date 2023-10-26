



// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

// const router = express.Router();


// backend/routes/api/session.js
const express = require('express')
const router = express.Router();



User Login API Route
In the backend/routes/api/session.js file, import the following code at the top of the file and create an Express router:

// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
Next, add the POST /api/session route to the router using an asynchronous route handler. In the route handler, query for the user identified by the provided credential (which can be either a username or email). Make sure to turn off the default scope so that you can read all the attributes of the user including hashedPassword.

If a user with those credentials isn't found in the database, then create a "Login failed" error and invoke the next error-handling middleware with it.

Or if a user with those credentials IS found in the database, but the password in the request body doesn't match the hashedPassword of the user found, then invoke the next error-handling middleware with the same "Login failed" error.

You can use the compareSync method from the bcryptjs node module to see if the request body's password matches with the user's hashedPassword in the database.

If the user's password is correct, call setTokenCookie and return a JSON response with the user's non-sensitive information. Make sure the JSON response doesn't include the hashedPassword.

Here's what the format of the JSON response should look like if the user is successfully logged in:

{
  user: {
    id,
    email,
    username
  }
}
// backend/routes/api/session.js
// ...

// Log in
router.post(
  '/',
  async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential
        }
      }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error('Login failed');
      err.status = 401;
      err.title = 'Login failed';
      err.errors = { credential: 'The provided credentials were invalid.' };
      return next(err);
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);


module.exports = router;
