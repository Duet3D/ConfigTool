<?php
$index = file_get_contents("index.html");

if ($_POST['json']) {
	echo str_replace("<script></script>", "<script>window.jsonTemplate = " . $_POST['json'] . "</script>", $index);
} else {
	echo str_replace("<script></script>", "<!-- No JSON field present -->", $index);
}
?>
