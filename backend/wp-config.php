<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'discord-web-archive' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'KDKNB(&2ra!(BzzUX>pxbXk%}N.}`8z1[OEi[mfVj LxS<v~;E)J~4W:P$5BmnU[' );
define( 'SECURE_AUTH_KEY',  'XKb.)#u`gPsr,/[moTo(tQ6MF,T!0^;drRMMiAj^&F.0[%LT8eI-g9PzC=G_+^1W' );
define( 'LOGGED_IN_KEY',    '-u6mG@a{2ja*<y5B`2hDG9r,#h3Pk&N7pGTN@I[xPQw&bnY3Fe+Ka0PnX{2QMPCl' );
define( 'NONCE_KEY',        'C6JXYmL9CbYdBZ%8)mp7an!hrz5fELy9gY0)3!8$vxV0hVTz=N@jUMtX_*vZkff,' );
define( 'AUTH_SALT',        'lMYw^bS}:`bMr)vEXjOleC,-ZQId;Onln^#evl(Q|>!akSC7|3%UvwT+/gz1`[UE' );
define( 'SECURE_AUTH_SALT', 'TW~MmrHDB9bqcbZbogl)Vzki0s^dh*?QVtJUPi~ mI@B#Krx/O-$$hei_|9W1Q{8' );
define( 'LOGGED_IN_SALT',   't`mOzi.Rsz!XiKdR{@Y[!a&l~w3L]RMY#rUxmIh8P_g0@^Rug] :k+M9o0HjVuE_' );
define( 'NONCE_SALT',       'LOX1RiU$(QMb&RY&0-nH4Lr]JX;F7`VvMog^GB:!>)LUsd![hV`3I+_x@]2]rL9|' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
