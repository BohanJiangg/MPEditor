/* globals document, window, JSON, require, CSInterface, CSEvent, SystemPath, VulcanInterface, VulcanMessage */
/* jshint asi:true, unused:false */



function onLoaded() {
	var cs = new CSInterface();
	// Initialize set Theme
	setAppTheme(null);
	// テーマが変わった時のイベントに登録
	cs.addEventListener( CSInterface.THEME_COLOR_CHANGED_EVENT, setAppTheme );
	// 'r' 押下されるとページをリロード。動作確認の時に便利。
	document.onkeypress = function(e) {
		if (e.charCode == 114) { window.location.reload(); }
	}
	// ツール側のスクリプトを実行するボタンの初期
	initToolScript();
	// ツール側のイベントを発送するボタンの初期
	initPanelEvents();
	initToolEvents();
	initCrossToolEvents();
}





/*
 *	Node.jsコアAPIの呼び方：
*/
function openDoc() {
var cs = new CSInterface();
var app = cs.hostEnvironment.appName;
var extPath = cs.getSystemPath(SystemPath.EXTENSION);
var jsxPath = extPath + "/jsx/open.jsx";
cs.evalScript( '$.evalFile( "' +jsxPath+ '")' );
}

function saveDoc() {
var cs = new CSInterface();
var app = cs.hostEnvironment.appName;
var extPath = cs.getSystemPath(SystemPath.EXTENSION);
var jsxPath = extPath + "/jsx/save.jsx";
cs.evalScript( '$.evalFile( "' +jsxPath+ '")' );
}


/*
 *	Node.js の外部ライブラリの使い方
*/
function openLink() {
	// node_modules フォルダにあるopenライブラリを呼ぶ：
	var open = require('open');
	open( "http://www.google.com" );
}


/*
 *	ホストツールからのイベントのハンドラー
*/
function setAppTheme(e) {
	// この例ではイベントオブジェクト(e)は不要。
	// テーマ情報をCSInterfaceから取得：
	var hostEnv = window.__adobe_cep__.getHostEnvironment();
	var skinInfo = JSON.parse(hostEnv).appSkinInfo;
	var color = skinInfo.panelBackgroundColor.color;
	var avg = (color.red+color.blue+color.green) / 3;
	// bg色の平均が128を超えるかどうかによってCSSを適用する：
	var type = (avg > 128) ? "light" : "dark";
	document.getElementById("topcoat-style").href = "css/topcoat-desktop-" + type + ".css";
	document.getElementById("main-style").href = "css/main-" + type + ".css";
	// パネルの body のbg色をツールに合わせる：
	var rgb = "rgb(" + 
		Math.round(color.red) 	+ "," +
		Math.round(color.green)	+ "," +
		Math.round(color.blue)	+ ")";
	document.body.style.backgroundColor = rgb;
}



/*
 *	ツール側のスクリプトの呼び方
*/
function initToolScript() {
	// Get the App name (for instance, PHXS, FLPR, ILST)
	var cs = new CSInterface();
	var app = cs.hostEnvironment.appName;
	// Initialize the UI
	var but = document.getElementById('tool-button');
	if (app=="FLPR") {
		but.innerHTML = "JSFL スクリプト実行";
	}

	// appによって、JSFLまたはJSXファイルを実行する
	var extPath = cs.getSystemPath(SystemPath.EXTENSION);
	if (app=="FLPR") {
		var jsflPath = extPath + "/jsx/tool.jsfl";
		jsflPath = encodeURI( "file://" + jsflPath );
		cs.evalScript( 'fl.runScript( "' +jsflPath+ '")' );
	} else {
		var jsxPath = extPath + "/jsx/tool.jsx";
		cs.evalScript( '$.evalFile( "' +jsxPath+ '")' );
	}

	// スクリプト実行ボタンのハンドラー
	but.onclick = function() {
		var js = "$.run_" +app+ "()";
		cs.evalScript( js );
	}
}



/*
 *	パネル内・パネル同士のイベント
*/
function initPanelEvents() {
	// イベントに登録＋ハンドラー
	new CSInterface().addEventListener(
		"com.aphall.testExtension.panelEvent", 
		function(event) {
			alert("Event type:" + event.type +
				  "\nData: " + event.data );
		}
	)
}
// panelイベントボタンのonclick:
function panelEvent() {
	var event = new CSEvent();
	event.type = "com.aphall.testExtension.panelEvent";
	event.scope = "APPLICATION";
	event.extensionId = window.__adobe_cep__.getExtensionId();
	event.data = "パネルイベントからこんにちは！";
	new CSInterface().dispatchEvent(event);
}




/*
 *	ツール側からイベントを発送させる処理
*/
function initToolEvents() {
	var cs = new CSInterface();
	var app = cs.hostEnvironment.appName;
	// ツール側のイベント発送に対応しない場合にボタンを無効にする
	if (app=="FLPR") {
		document.getElementById('tool-event').disabled = true;
	} else {
		// イベント登録＋ハンドラー
		cs.addEventListener( "com.andy.toolEvent", function(ev) {
			alert("ツールからのイベント" + 
				  "\n type: "+ev.type +
				  "\n data: "+ev.data );
		});
	}
}

// ツールからカスタムイベントを発送させる
function toolEvent() {
	var js = "$.sendEvent('com.andy.toolEvent')";
	new CSInterface().evalScript( js );
}



/*
 *	ツール同士のイベント
*/
function initCrossToolEvents() {
	var cs = new CSInterface();
	var app = cs.hostEnvironment.appName;
	// ツール名によってリスナーを登録
	var type = "aphall.msg." + app;
	VulcanInterface.addMessageListener( 
		VulcanMessage.TYPE_PREFIX + type,
		function(message) {
			var str = VulcanInterface.getPayload(message);
			cs.evalScript( 'alert("ツール同士イベント： '+str+'")' );
		}
	);
}


	

