// ==UserScript==
// @name           RU_CHP
// @namespace      http://ru_chp.livejournal.com/
// @description    improve video view in ru_chp (inspired with http://www.alk.lv/RU_CHP.user.js)
// @include        http://ru-chp.livejournal.com/*
// @exclude        http://ru-chp.livejournal.com/ru_chp/*
// ==/UserScript==

function append_forms_by_id(element, id) {
	alk_url = "http://ru-chp.livejournal.com/" + id + ".html"
	text =
'<input type="hidden" name="journal" value="ru_chp">' +
'<input type="text" name="url" size="40" id="ruchpPostUrl" readonly="readonly" class="text" value="' + alk_url + '">' +
'<input type="submit" class="submit" value="search on alk.lv" alt="Ok"> ';

	var form = document.createElement("form");
	form.setAttribute("action", "http://www.alk.lv/ruchp");
	form.setAttribute("target", "_blank");
	form.innerHTML=text;

	element.appendChild(form);

	rucrash_url = "http://video.rucrash.com/ruchp/" + id + ".mp4";
	text =
'<input type="text" name="url" size="40" id="ruchpPostUrl" readonly="readonly" class="text" value="' + rucrash_url + '">' +
'<input type="submit" class="submit" value="download from rucrash" alt="Ok"> ';
	var form = document.createElement("form");
	form.setAttribute("action", rucrash_url);
	form.setAttribute("target", "_blank");
	form.innerHTML=text;
	element.appendChild(form);
}

function inlined_videos_count(element) {
	var videos = element.getElementsByTagName("iframe");
	return videos ? videos.length : 0;
}

function find_id(element, entry) {
	// if there are no videos
	// there is no reason to search id
	if (inlined_videos_count(entry) == 0)
		return false;
	var ruchp = "http://ru-chp.livejournal.com/";
    if (element.getElementById === undefined) {
		var as = element.getElementsByTagName("a")[0];
		as = as.getAttribute("href");
		// ensure that current post is in ru-chp
		if (as && as.indexOf(ruchp) == 0)
			return as.replace(ruchp, "").replace(".html", "");
	} else {
		// find in current open post
        var	postform = element.getElementById("postform");
        if (!postform)
			return false;
		// ensure that current post is in ru-chp
		if (element.location.toString().indexOf(ruchp) != 0)
			return false;
		var inputs = postform.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].getAttribute("name") == "itemid")
				return inputs[i].getAttribute("value");
		}
	}
	return false;
}

function append_in_mine_style() {
	var entries = this.document.getElementsByTagName("div");
	for (var i = 0; i < entries.length; i++ ) {
		// find post
		var entry = entries[i];
		var id = false;
		if (entry.getAttribute("class")== "b-singlepost-body") {
			// if single post view
			id = find_id(this.document, entry);
			entry = entry.parentNode;
		} else if (entry.getAttribute("style") == "text-align:left") {
			// if community feed
			id = find_id(entry, entry);
		}
		if (id)
			append_forms_by_id(entry, id);
	}
}

function append_in_own_style() {
	var entries = this.document.getElementsByTagName('dl');
	// enumerate all <dl> tags
	for (var i = 0; i < entries.length; i++ ) {
		// find every post
		if (entries[i].getAttribute("class") == "entry hentry") {
			id = entries[i].id;

			var dds = entries[i].getElementsByTagName('dd');
			for (var j = 0; j < dds.length; j++ ) {
				if (dds[j].getAttribute("class") == "entry-text") {
					if (inlined_videos_count(dds[j]) == 0)
						// if no videos, do not add any forms
						continue;
					// find post text
					id = id.replace("post-ru_chp-", "");
					append_forms_by_id(dds[j], id);
				}
			}
		}
	}
}

// determine own/mine style
// own community style has <html xmlns=""...
mine_style = this.document.getElementsByTagName("html")[0].getAttribute("xmlns") == null;
// for own community view-style
if (mine_style) {
	append_in_mine_style();
} else {
	append_in_own_style();
}
