<?php
session_start();
$conn = new mysqli("localhost", "dein_db_user", "dein_db_pass", "forum");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            header("Location: index.php");
            exit();
        }
    }
    $error = "Falscher Benutzername oder Passwort!";
}
?>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
<div class="chat-box">
<h2>Login</h2>
<?php if (isset($error)) echo "<p style='color: red'>$error</p>"; ?>
<form method="POST">
<input type="text" name="username" placeholder="Benutzername" required>
<input type="password" name="password" placeholder="Passwort" required>
<button type="submit" class="btn">Einloggen</button>
</form>
</div>
</div>
</body>
</html>
