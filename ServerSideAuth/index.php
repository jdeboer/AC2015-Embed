<?php
	/**
	 *	Load the Google API PHP Client Library - download link: https://github.com/google/google-api-php-client
	 */
	require_once dirname(__DIR__) . '/../google-api-php-client/src/Google/autoload.php';	// Set path to autoload.php
	
	/**
	 *	Service account email, and location of keyfile
	 */
	$clientEmail = 'PLACE SERVICE ACCOUNT EMAIL HERE'; 
	$keyFileLoc = 'SET PATH TO GENERATED P12 KEYFILE';
	
	/**
	 *	Create and config client object
	 */
	$client = new Google_Client();
	$client->setApplicationName("2015 AC Demos");
		
	/**
	 *	Read the content of the generated p12 keyfile and set API scopes
	 */
	$private_key = file_get_contents($keyFileLoc);
	$scopes = array(Google_Service_Analytics::ANALYTICS_READONLY); 
	
	/**
	 *	Apply authorisation credentials
	 */
	$creds = new Google_Auth_AssertionCredentials(
		$clientEmail,
		$scopes,
		$private_key
	);
	$client->setAssertionCredentials($creds);
	
	/**
	 *	Refresh access token if expired
	 */
	if($client->getAuth()->isAccessTokenExpired()){
		$client->getAuth()->refreshTokenWithAssertion();
	}
?>
<html>
	<head>
		<title>AC 2015 | Embed API Demos</title>
		<link href="index.css" rel="stylesheet">
	</head>
	<body>
		<script>
		(function(w,d,s,g,js,fs){
		  g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}};
		  js=d.createElement(s);fs=d.getElementsByTagName(s)[0];
		  js.src='https://apis.google.com/js/platform.js';
		  fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');};
		}(window,document,'script'));
		</script>
		
		<h1>Embed API | Service account demo</h1>
		<div id="view-selector-container"></div>
		<div id="chart-1-container"></div>
		<div id="chart-2-container"></div>
		
		<script>
		gapi.analytics.ready(function() {
		
		  /**
		   *	Authorize the user with an access token obtained server side.
		   */
		  gapi.analytics.auth.authorize({
		    'serverAuth': <?php echo $client->getAccessToken();?>
		  });
		  
		  /**
		   *	View selector to list all views available in the service account
		   */
		  var viewSelector = new gapi.analytics.ViewSelector({
		  	'container' : 'view-selector-container'
		  });
		
		  /**
		   *	Creates a new DataChart instance showing sessions over the past 30 days.
		   *	It will be rendered inside an element with the id "chart-1-container".
		   */
		  var dataChart1 = new gapi.analytics.googleCharts.DataChart({
		    query: {
		      //'ids': 'ga:15853276', // The Demos & Tools website view.
		      'start-date': '30daysAgo',
		      'end-date': 'yesterday',
		      'metrics': 'ga:sessions,ga:users',
		      'dimensions': 'ga:date'
		    },
		    chart: {
		      'container': 'chart-1-container',
		      'type': 'LINE',
		      'options': {
		        'width': '100%'
		      }
		    }
		  });
		  //dataChart1.execute();
		
		
		  /**
		   *	Creates a new DataChart instance showing top 5 most popular demos/tools
		   *	amongst returning users only.
		   *	It will be rendered inside an element with the id "chart-3-container".
		   */
		  var dataChart2 = new gapi.analytics.googleCharts.DataChart({
		    query: {
		      //'ids': 'ga:15853276', // The Demos & Tools website view.
		      'start-date': '30daysAgo',
		      'end-date': 'yesterday',
		      'metrics': 'ga:pageviews',
		      'dimensions': 'ga:pagePathLevel1',
		      'sort': '-ga:pageviews',
		      'filters': 'ga:pagePathLevel1!=/',
		      'max-results': 7
		    },
		    chart: {
		      'container': 'chart-2-container',
		      'type': 'PIE',
		      'options': {
		        'width': '100%',
		        'pieHole': 4/9,
		      }
		    }
		  });
		  //dataChart2.execute();
		  
		  viewSelector.on("change", function(ids){
		  	var newIds = {
		  		"query" : {
		  			"ids" : ids
		  		}
		  	};
		  	
		  	dataChart1.set(newIds).execute();
		  	dataChart2.set(newIds).execute();
		  });
		  
		  viewSelector.execute();
		
		});
		</script>
		
	</body>
</html>