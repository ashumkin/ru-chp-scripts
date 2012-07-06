// ==UserScript==
// @name           RU_CHP
// @namespace      http://ru_chp.livejournal.com/
// @description    improve video view in ru_chp (inspired with http://www.alk.lv/RU_CHP.user.js)
// @include        http://ru-chp.livejournal.com/*
// @exclude        http://ru-chp.livejournal.com/ru_chp/*
// ==/UserScript==

var entries = document.getElementsByTagName('dl');
// enumerate all <dl> tags
for (var i = 0; i < entries.length; i++ ) {
	// find every post
	if (entries[i].getAttribute("class") == "entry hentry") {
		id = entries[i].id

		var dds = entries[i].getElementsByTagName('dd');
		for (var j = 0; j < dds.length; j++ ) {
			if (dds[j].getAttribute("class") == "entry-text") {
				var youtube = dds[j].getElementsByTagName('iframe');
				// if no videos, do not add any forms
				if (youtube.length == 0) {
					continue;
				}
				// find post text
				id = id.replace("post-ru_chp-", "")
				alk_url = "http://ru-chp.livejournal.com/" + id + ".html"
				text =
'<input type="hidden" name="journal" value="ru_chp">' +
'<input type="text" name="url" size="40" id="ruchpPostUrl" readonly="readonly" class="text" value="' + alk_url + '">' +
'<input type="submit" class="submit" value="search on alk.lv" alt="Ok"> ';

				var form = document.createElement("form");
				form.setAttribute("action", "http://www.alk.lv/ruchp");
				form.setAttribute("target", "_blank");
				form.innerHTML=text;

				dds[j].appendChild(form);

				rucrash_url = "http://video.rucrash.com/ruchp/" + id + ".mp4"
				text =
'<input type="text" name="url" size="40" id="ruchpPostUrl" readonly="readonly" class="text" value="' + rucrash_url + '">' +
'<input type="submit" class="submit" value="download from rucrash" alt="Ok"> ';
				var form = document.createElement("form");
				form.setAttribute("action", rucrash_url);
				form.setAttribute("target", "_blank");
				form.innerHTML=text;
				dds[j].appendChild(form);

			}
		}
	}
}



