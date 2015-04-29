#target photoshop
var  destDir = Folder.selectDialog( 'Select the export directory.');
		
var jpegOptions = new JPEGSaveOptions();
		jpegOptions.quality = 10;
		jpegOptions.embedColorProfile = false;
		app.activeDocument.saveAs( File( destDir+ "/" + activeDocument.name+ ".jpg"), jpegOptions, false);