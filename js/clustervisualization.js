google.load("visualization", "1", {packages:["corechart"]});



/* A global variable ... */
var initial_number_droplets = 22000;
var current_cutoff = 0.0;
var negative_cutoff = 0.0;

function makeArray(count, content) {
   var result = [];
   if(typeof(content) == "function") {
      for(var i=0; i<count; i++) {
         result.push(content(i));
      }
   } else {
      for(var i=0; i<count; i++) {
         result.push(content);
      }
   }
   return result;
}


function distance_from_mean(mean, an_array){
	// returns the sums of squares distance from the mean..
	var total_distance = 0.0;
	var current_distance = 0.0;
	for(i=0;i<an_array.length;i++){
		current_distance = (an_array[i]-mean) * (an_array[i]-mean)
		total_distance += current_distance;
	}
	return total_distance;
	
}

function means(arrayToProcess){
	var total = 0.0;
	var current_num=0.0;
	var counted = 0;
	var mean =0.0;
	
	for (i=0; i<arrayToProcess.length; i++){
		current_num = Math.round(arrayToProcess[i],3);
		if (!isNaN(current_num)){
			counted++;
			total = total + current_num;
		}
	}
	
	mean = total/counted;
	return mean;	
}

function standard_deviation(arrayToProcess, the_mean){
	var counted=0;
	var running_total =0.0;
	var current=0.0;
	
	for(count=0;count<arrayToProcess.length;count++){
		var current_num = parseFloat(arrayToProcess[count]);
		if (!isNaN(current_num)){
			counted++;
			//total = total + current_num;
			current = (current_num-the_mean)*(current_num-the_mean);
			running_total = running_total + current;
		}
	}
	running_total = Math.sqrt(running_total/counted);
	////console.debug(running_total);
	return running_total;		
}


function kmeans( arrayToProcess, Clusters )
{

  var Groups = new Array();
  var Centroids = new Array();
  var oldCentroids = new Array();
  var changed = false;

  // order the input array
  arrayToProcess.sort(function(a,b){return a - b})  

  // initialise group arrays
  for( initGroups=0; initGroups < Clusters; initGroups++ )
  {

    Groups[initGroups] = new Array();

  }  

  // pick initial centroids (should use random??)
  initialCentroids=Math.round( arrayToProcess.length/(Clusters+1) );  
  

  for( i=0; i<Clusters; i++ )
  {

    Centroids[i]=arrayToProcess[ (initialCentroids*(i+1)) ];
	 //console.debug(Centroids[i]);
  }
  
  var old_ss = 0;
  var max_iterations = 0;
  do
  {
    max_iterations++;
    for( j=0; j<Clusters; j++ )
	{

	  Groups[j] = [];

	}

    changed=false;

	for( i=0; i<arrayToProcess.length; i++ )
	{

	  Distance=-1;
	  oldDistance=-1

 	  for( j=0; j<Clusters; j++ )
	  {

        distance = Math.abs( Centroids[j]-arrayToProcess[i] );	

		if ( oldDistance==-1 )
		{

		   oldDistance = distance;
		   newGroup = j;

		}
		else if ( distance <= oldDistance )
		{

		    newGroup=j;
			oldDistance = distance;

		}

	  }	

	  Groups[newGroup].push( parseFloat(arrayToProcess[i]) );	  

	}
	
    
    oldCentroids=Centroids;
    var sum_squares = 0.0;
	var current_sum_squares = 0.0;
    for ( j=0; j<Clusters; j++ )
	{

      var total=0.0;
	  newCentroid=0;

	  for( i=0; i<Groups[j].length; i++ )
	  {
		if (!isNaN(Math.round(parseFloat(Groups[j][i]),3))){
	    	total = total + Math.round(parseFloat(Groups[j][i]),3);
		}
		if (isNaN(total)){
			break;
		}

	  }
	  newCentroid= Math.round(total/Groups[j].length,3);
	  ////console.debug(newCentroid);  
	  current_sum_squares = Math.round(distance_from_mean(newCentroid, Groups[j]),3);
	  Centroids[j]=newCentroid;
	  sum_squares = sum_squares + current_sum_squares;
	}
	////console.debug("Rotation %s total ss %f %f", max_iterations, sum_squares, old_ss);
		
	// now check to see what the differences are 
   if (max_iterations==1){
		old_ss = sum_squares;
	}
	else{
		if (sum_squares==old_ss){
			// no improvement so break the loop.
			max_iterations=1000;
		}
		old_ss = sum_squares;
	}
   
  }
  while( max_iterations<10 );

  Groups[0] = remove_na(Groups[0]);
  Groups[1] = remove_na(Groups[1]);
  return Groups;

}

// This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
    	// Check to see if the delimiter is defined. If not,
    	// then default to comma.
    	strDelimiter = (strDelimiter || ",");

    	// Create a regular expression to parse the CSV values.
    	var objPattern = new RegExp(
    		(
    			// Delimiters.
    			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    			// Quoted fields.
    			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    			// Standard fields.
    			"([^\"\\" + strDelimiter + "\\r\\n]*))"
    		),
    		"gi"
    		);


    	// Create an array to hold our data. Give the array
    	// a default empty first row.
    	var arrData = [[]];

    	// Create an array to hold our individual pattern
    	// matching groups.
    	var arrMatches = null;


    	// Keep looping over the regular expression matches
    	// until we can no longer find a match.
    	while (arrMatches = objPattern.exec( strData )){

    		// Get the delimiter that was found.
    		var strMatchedDelimiter = arrMatches[ 1 ];

    		// Check to see if the given delimiter has a length
    		// (is not the start of string) and if it matches
    		// field delimiter. If id does not, then we know
    		// that this delimiter is a row delimiter.
    		if (
    			strMatchedDelimiter.length &&
    			(strMatchedDelimiter != strDelimiter)
    			){

    			// Since we have reached a new row of data,
    			// add an empty row to our data array.
    			arrData.push( [] );

    		}


    		// Now that we have our delimiter out of the way,
    		// let's check to see which kind of value we
    		// captured (quoted or unquoted).
    		if (arrMatches[ 2 ]){

    			// We found a quoted value. When we capture
    			// this value, unescape any double quotes.
    			var strMatchedValue = arrMatches[ 2 ].replace(
    				new RegExp( "\"\"", "g" ),
    				"\""
    				);

    		} else {

    			// We found a non-quoted value.
    			var strMatchedValue = arrMatches[ 3 ];

    		}


    		// Now that we have our value string, let's add
    		// it to the data array.
    		arrData[ arrData.length - 1 ].push( strMatchedValue );
    	}

    	// Return the parsed data.
    	return( arrData );
    }

function remove_na(an_array){
	if (isNaN(parseFloat(an_array[0]))==true){
		//console.debug("ok!!")
	    an_array.shift();
		an_array = remove_na(an_array);
	}
	return an_array;
}

function remove_na_two(an_array){
	an_array.shift();
	if (an_array[0]==""){
		an_array.shift();
		an_array=remove_na_two(an_array);
	}
	return an_array;
}

function cleanArray(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}

function histogram(an_array, break_size){
	var holder = [];
	/* remove any stange blankness (caused by line breaks to be removed)*/
    an_array = cleanArray(an_array);
	//console.debug(an_array);
	var min_size = parseFloat(an_array[0]);
	var max_size = parseFloat(an_array[an_array.length-1]);
	var current_amplitude = parseFloat(min_size).toFixed();
	var break_start = parseFloat(current_amplitude);
	var current_break_count = 1;
	for (var count=min_size;count<max_size;count=count+break_size){
		current_break_count = 0;
		for(i=0;i<an_array.length;i++){
			if (parseFloat(an_array[i])>=count && parseFloat(an_array[i])<count+break_size){
				current_break_count++;
			}
			if(parseFloat(an_array[i])>(count+break_size)){
				break;
			}
	    }
	   holder.push([count,current_break_count]);
	}
    //console.debug(holder);
	return holder;
}

function create_labels(all_the_data, min_group2){
	var holder = [];
	for (i=0;i<all_the_data.length;i++){
		if (parseFloat(all_the_data[i][0])<min_group2){
			holder.push("blue");
		}
		else{
			holder.push("red");
		}
	}
	return holder;
}


  google.load("visualization", "1", {packages:["corechart","table"]});
      //google.setOnLoadCallback(drawChart);
      function drawChart(data2use,divtouse,mingrp2) {
         var data = new google.visualization.DataTable();
         
				data.addColumn('number','Amplitude');
				data.addColumn('number','Negative');
				data.addColumn('number','Positive');
		         for (i=0;i<data2use.length;i++){
					if (parseFloat(data2use[i][0])<parseFloat(mingrp2)){
					//	//console.debug(data2use[i][0]);
					data.addRow([data2use[i][0],data2use[i][1],0]);
					}
					else{
							data.addRow([data2use[i][0],0,data2use[i][1]]);
					}
					////console.debug(hist2[i]);
				}

		        var options = {
		          title: 'Distribution of Droplet Amplitude Values.',
		          vAxis: {title:"Number of Droplets"},
		          hAxis: {title:"Amplitude"},
				  isStacked:true,
				  bar: {groupWidth:'100%'},
				  series: [{color:'blue', visibleInLegend:true},{color: 'red',visibleInLegend:true}]
				  
		         
		        };
				////console.debug(data.getNumberRows());
		        var chart = new google.visualization.ColumnChart(document.getElementById(divtouse));
		        chart.draw(data, options);
      }

function drawSummaryData(kmeandata, div_to_update){
	var total_droplets = 0;
	var mean_negative_droplets = 0.0;
	var mean_positive_droplets = 0.0;
	var sd_positive = 0.0;
	var sd_negative = 0.0;
	var cutoff = 0.0;
	mean_negative_droplets = means(kmeandata[0]);
	mean_positive_droplets = means(kmeandata[1]);
	sd_negative = standard_deviation(kmeandata[0], mean_negative_droplets);
	sd_positive = standard_deviation(kmeandata[1], mean_positive_droplets);
	
	cutoff = mean_positive_droplets-(3*sd_positive);
	negative_cutoff = mean_negative_droplets+(3*sd_negative);
	
	var def_neg=0;
	var def_pos=0;
	for(var ac=0;ac<kmeandata[0].length;ac++){
		if (kmeandata[0][ac]<negative_cutoff){
			def_neg++;
		}
	}
	for (var ac2=0;ac2<kmeandata[1].length;ac2++){
			if (kmeandata[1][ac2]>cutoff){
				def_pos++;
			}
	}
	
	var nc = negative_cutoff;
	var data = new google.visualization.DataTable();
	data.addColumn('string','Droplet Classification');
	data.addColumn('string','Droplet Count');
	data.addColumn('string','Mean Amplitude Value');
	data.addColumn('string','SD in Amplitude');
	data.addColumn('string','Cutoff Value');
	data.addColumn('string','Number defined by cutoff');
	data.addRows([
		['Positive',kmeandata[1].length.toFixed(),mean_positive_droplets.toFixed(3),sd_positive.toFixed(3),">"+cutoff.toFixed(3), def_pos.toFixed()],
		['Negative',kmeandata[0].length.toFixed(),mean_negative_droplets.toFixed(3),sd_negative.toFixed(3),'<'+nc.toFixed(3), def_neg.toFixed()]
		]);
	
	var table = new google.visualization.Table(document.getElementById(div_to_update));
	table.draw(data, {showRowNumber: false});
	return cutoff;
}

function concentration(pos_count,total_count){
	var ncount = total_count - pos_count;
	// this is the key calculation whic returns the copy number per 20 micro litres.
	var ratio = Math.abs(-Math.log(ncount/total_count)/0.91)*1000*20; 
	//console.debug(ratio);
	return ratio; 
}

function call_concentration_with_cutoff(file_amplitudes, thecutoff, div_to_use, div_result, filenames, file_positions){
	var running_res = [];
	var running_total = 0.0;
	var data = new google.visualization.DataTable();
	data.addColumn('string','Partition');
	data.addColumn('string','Negative Droplets');
	data.addColumn('string','Positive Droplets');
	data.addColumn('string','Total Valid Droplets');
	data.addColumn('string', 'Poisson Estimate');
	data.addColumn('string', 'Number of rain droplets');
	
	//console.debug("whati exped %d", file_amplitudes.length);
	for (i=0;i<file_amplitudes.length;i++){
		//console.debug("File %d num amplitudes %d",i,file_amplitudes[i].length);
		var current_amplitudes = file_amplitudes[i];
		
		current_amplitudes = remove_na(current_amplitudes);
		var neg_count=0;
		//console.debug(current_amplitudes);
	
		var file_amps = [];
		var pos_count = 0;
		for (j=0;j<current_amplitudes.length;j++){
			////console.debug("%d %d", current_amplitudes[j], thecutoff);
			if (parseFloat(current_amplitudes[j])<parseFloat(negative_cutoff)){
				////console.debug("%f %d", parseFloat(current_amplitudes[j]), thecutoff);
				neg_count++;
				//break;
			}
			else{
				if (parseFloat(current_amplitudes[j])>=parseFloat(thecutoff)){
					pos_count++;
				}
				//break;
			}
		
		}
		//console.debug("%d %d",pos_count,neg_count);
		var a_total = neg_count + pos_count;
		var file_res = concentration(pos_count, a_total);
		running_total = running_total + file_res;
		
		//console.debug("Neg count %d pos count %d total %d concentration %f", neg_count, current_amplitudes.length-neg_count, current_amplitudes.length,file_res );
		
		data.addRow([filenames[i],(neg_count).toFixed(), (pos_count).toFixed(),  a_total.toFixed(),file_res.toFixed(3),(current_amplitudes.length-a_total).toFixed()]);
		
	}
	//console.debug("Final %f",running_total);
	var vtemp = parseFloat(thecutoff);
	var vtemp_lower = parseFloat(negative_cutoff);
	document.getElementById(div_result).innerHTML = "<h3>Using a cutoff Amplitude of &gt;" + vtemp.toFixed(3) + " and &lt; " + vtemp_lower.toFixed() + " the concentration is " + running_total.toFixed() + " copies per 20 &#956;l  </h3>" 
	
    var table = new google.visualization.Table(document.getElementById(div_to_use));
	table.draw(data);
	
}


function display_new_form(cutoff){
	
	document.getElementById("count_using_cutoff").innerHTML="<h2>Analyze droplet files using the cutoff defined by the positive control above.</h1><form enctype=\"multipart/form-data\"  method=\"post\"><input type=\"file\" id=\"files\" name=\"files[]\" multiple /></form>"
}

function draw_specific_chart(amplitudes, div_to_update, colour, the_title, modifier){
	var hist = histogram(amplitudes, 50);
	var data = new google.visualization.DataTable();
	data.addColumn("number","Amplitude");
	data.addColumn("number","Number of Droplets");
	for (var i=0;i<hist.length;i++){
		data.addRow(hist[i]);
	}
	
	var options = {
			  title: the_title,	
	          hAxis: {title: 'Amplitude' },
			  vAxis: {title: 'Droplet Count'},
			  isStacked: true,
			  bar: {groupWidth: '100%'},
			  series: [{color: colour,visibleInLegend:false}]
	        };
	div_to_update = div_to_update + "_" + modifier.toFixed();
	//console.debug("populated specific..");
	//console.debug(div_to_update);
	//console.debug(hist);
	var chart = new google.visualization.ColumnChart(document.getElementById(div_to_update));
	chart.draw(data, options);
	
	
}

function draw_separate_amplitude_histograms(file_amplitudes, cutoff){
	
	for (var count =0;count<file_amplitudes.length;count++){
	negative_amplitudes = [];
	positive_amplitudes = [];
	var total_amplitude = file_amplitudes[count];
	
	for(var i=0;i<total_amplitude.length;i++){
		if (parseFloat(total_amplitude[i])<parseFloat(cutoff)){
			negative_amplitudes.push(total_amplitude[i]);
		}
		else{
			positive_amplitudes.push(total_amplitude[i]);
		}
	}
	//console.debug("calling positives??");
	//console.debug(positive_amplitudes);
		draw_specific_chart(negative_amplitudes, "negative_count","blue","Negative Droplets",count);
		draw_specific_chart(positive_amplitudes, "positive_count","red","Positive Droplets",count);
	}
	
	
}


function handleFileSelectCount(evt){
	//console.debug("as you requested geezer!");
	// FileReaderJS.setupInput(document.getElementById('file-input'),);
	var files = evt.target.ftocount;
	var files2 = evt.target.files;
	//console.debug(files2);
	
	var call_counter = 0;
	//var call_counter_2 = 0;
	var filenames = [];
	var total_amplitude = [];
	//var holder = [];

	for (var i =0,f;f=files2[i];i++){
		var reader = new FileReader();
		reader.file_amplitude = [];
		reader.total_amplitude = [];
		reader.file_pos = [];
		reader.fname = [];
		//reader.fname.push(f.name);
		// deal with the file information....
		reader.onload = (function(e){
			var contents = e.target.result;
			var csv_d = CSVToArray(contents);
	    	var amplitudes = csv_d.map(function(value,index){ return parseFloat(value[0]); });
	        //holder.push(call_counter_2);
	        //console.debug(holder);
			reader.file_amplitude.push(amplitudes);
			//call_counter_2++;
	   });
	
	   reader.onloadend = (function(e){
			 call_counter++;
			 //reader.fname.push(f.name);
			 //console.debug(reader.fname);
			/*** the last file has been loaded... ***/
			if (call_counter==(files2.length)){
				//reader.total_amplitude.sort(function(a,b){return a - b});
				draw_separate_amplitude_histograms(reader.file_amplitude, current_cutoff);
				//console.debug(reader.file_pos);
				call_concentration_with_cutoff(reader.file_amplitude,current_cutoff,"to_count","to_count_result",filenames);
				}
		});
	  //console.debug(reader);
	  /* pass the file contents into the FileReader class */
	  reader.readAsText(f);
	  filenames.push(f.name);
	  /*** This to carry out the fix for Nasha 30 April 2014 ***/
	  /*** The main problem is due to the reading being Asynchronous by default and no standard way to
	   set the reading to synchronous **/
	  var startNow = new Date();
	  var pauseFor = 1000;
	  while (new Date()-startNow < pauseFor)
	  	;
	 // console.debug("here I am saying %d", holder.length);
	  
	}
}



function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    var mean_group1 = 0.0;
    var mean_group2 = 0.0;
    var limit1 = 0.0;
    var limit2 = 0.0;
    var amplitudes = [];
    var total_amplitude = [];
    var call_counter = 0
	var file_names = [];
    for (var i = 0, f; f = files[i]; i++) {
      	output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
		file_names.push(f.name);
		var reader = new FileReader();
		reader.fnames = [];
		reader.total_amplitude = [];
		reader.file_amplitude = [];

		// deal with the file information....
		reader.onload = (function(e){
			var contents = e.target.result;
			//console.debug(e);
			var csv_d = CSVToArray(contents);
	    	amplitudes = csv_d.map(function(value,index){ return value[0]; });
			reader.file_amplitude.push(amplitudes);
			var the_header = amplitudes.shift();
			total_amplitude = total_amplitude.concat(amplitudes);
			reader.total_amplitude = total_amplitude;
			reader.fnames.push(e.target.name);
	   });
	   
	/* write the kmeans results to screen .... */
	reader.onloadend = (function(e){
		    call_counter++;
		    //var groups = kmeans(reader.total_amplitude);
		    /*** the last file has been loaded... ***/
			if (call_counter==(files.length)){
				reader.total_amplitude = remove_na(reader.total_amplitude);
				var groups = kmeans(reader.total_amplitude, 2);
				groups[0].sort(function(a,b){return a-b});
				groups[1].sort(function(a,b){return a-b});
				var min_group2 = groups[1][0];
				var a_holder = [];
				a_holder = a_holder.concat(groups[0]);
				a_holder = a_holder.concat(groups[1]);
				// create the histogram
				var hist = histogram(a_holder, 50);
				// draw the histogram
		 		drawChart(hist,"every_chart_div", min_group2);
				var cutoff = drawSummaryData(groups, "summary_positive_control");
				current_cutoff = cutoff;
				call_concentration_with_cutoff(reader.file_amplitude, cutoff, "positive_call", "positive_result", file_names);
				display_new_form(cutoff);
				
			}
			
	});
	
    reader.readAsText(f);
   
   }
 
}	
  
  
    /*document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';*/
  


