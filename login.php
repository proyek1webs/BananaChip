<?php
session_start();

// Cek jika admin sudah login, arahkan ke menu.html dengan flag admin
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header("location: menu.html?admin=true");
    exit;
}

// Sertakan file koneksi database
require_once "db_config.php";

$username = $password = "";
$username_err = $password_err = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Validasi username
    if (empty(trim($_POST["username"]))) {
        $username_err = "Mohon masukkan username.";
    } else {
        $username = trim($_POST["username"]);
    }

    // Validasi password
    if (empty(trim($_POST["password"]))) {
        $password_err = "Mohon masukkan password.";
    } else {
        $password = trim($_POST["password"]);
    }

    // Cek input
    if (empty($username_err) && empty($password_err)) {
        try {
            $sql = "SELECT id, username, password FROM users WHERE username = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$username]);
            
            $user = $stmt->fetch();

            if ($user) {
                if (password_verify($password, $user['password'])) {
                    // Password cocok, mulai session
                    $_SESSION["loggedin"] = true;
                    $_SESSION["id"] = $user['id'];
                    $_SESSION["username"] = $user['username'];
                    
                    // Arahkan ke halaman menu dengan flag admin
                    header("location: menu.html?admin=true");
                    exit;
                } else {
                    $password_err = "Password yang Anda masukkan tidak valid.";
                }
            } else {
                $username_err = "Username tidak ditemukan.";
            }
        } catch (PDOException $e) {
            echo "Ada yang salah. Silakan coba lagi nanti. Error: " . $e->getMessage();
        }
    }
    // PDO connection closes when variable is destroyed
    $conn = null;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin - Banana King Chips</title>
    <link rel="stylesheet" href="stylephp.css">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
</head>
<body class="login-page">
    <div class="login-container">
        <a href="index.html" class="logo">Banana <span>King</span></a>
        <h2>Login Admin</h2>
        <p>Silakan masukkan kredensial Anda untuk mengakses fitur admin.</p>
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" class="form-control <?php echo (!empty($username_err)) ? 'is-invalid' : ''; ?>" value="<?php echo htmlspecialchars($username); ?>">
                <span class="invalid-feedback"><?php echo $username_err; ?></span>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" class="form-control <?php echo (!empty($password_err)) ? 'is-invalid' : ''; ?>">
                <span class="invalid-feedback"><?php echo $password_err; ?></span>
            </div>
            <div class="form-group">
                <input type="submit" class="btn" value="Login">
            </div>
        </form>
    </div>
</body>
</html>