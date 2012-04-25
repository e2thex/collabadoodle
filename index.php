<?php
if (!isset($_REQUEST['canvas']) ){
     $uuid = uniqid();
     header( 'Location: ?canvas='.$uuid ) ;
}
function file_name($uuid) {
  return dirname(__FILE__)."/data/". $uuid. '.json';
}
function get_data($uuid) {
 $filename = file_name($uuid);
 $data = array();
 if(file_exists($filename)) {
   $data = file_get_contents($filename);
   $data = json_decode($data, TRUE);
 }
 return $data;
}
function check_data($data, $uuid) {
 $old_data = get_data($uuid);
 return ($data == $old_data);
}
function wait_for_data($data, $uuid) {

 if (check_data($data, $uuid)) {
   usleep(10000);
   wait_for_data($data, $uuid);
 }
 else {
   return_json(get_data($uuid));
 }
}

function sleep_for_ever() {
   usleep(10000);
   sleep_for_ever();
}
function return_json($json) {

  header('Content-type: application/json');
  print json_encode(array('data'=>$json, 'id' => $_POST['id']));
  exit;
}

function main() {
  $uuid = $_REQUEST['canvas'];
  if (isset($_POST['new']) || isset($_GET['new'])) {
     return_json(get_data($uuid));
  }
  elseif(isset($_POST['data_call'])) {
   $new_data = isset($_POST['data']) ? $_POST['data'] : array();
   if (check_data($new_data, $uuid)) {
     wait_for_data($new_data, $uuid);
   }
   else {
     $filename = file_name($uuid);
     file_put_contents($filename,json_encode($new_data));
     return_json($new_data);
   }
  }
}
main();

?>
<meta name="viewport" content="width=device-width, initial-scale=1"> 
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css" />
<script src = './raphael.js'></script>
<script src = 'http://code.jquery.com/jquery-1.7.2.min.js'></script>
<script src="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js"></script>
<script src = './vnote.js'></script>
<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />
<script type="text/javascript" src="js/colorpicker.js"></script>
<body style="">
<div id="canvas"></div>
<style>
#canvas {
  border: 3px inset black;
  width:1000;
  height:800;
}
</body>
