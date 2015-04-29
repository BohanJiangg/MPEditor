 var myFile = File.openDialog("Please select file to open...");
  if (myFile != null){
  // open file
  open(myFile);
 

  }else{
    alert("No file selected.");
  }