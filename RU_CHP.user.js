// ==UserScript==
// @name           RU_CHP
// @author         Alexey Shumkin aka Zapped
// @license        GPL
// @version        0.0.6.6
// @version        0.0.6.6 - Added "https" scheme to @include
// @version        0.0.6.5 - Added "ru_chp.livejournal.com" to @include
// @history        0.0.6.4 - Note non-Youtube videos
// @history        0.0.6.3 - Make time detection smarter. Detect from phrases "From N seconds".
// @history        0.0.6.2 - Fixed Youtube links detection when placeholders are on
// @history        0.0.6.1 - Skip inlined NOT from Youtube videos
// @history        0.0.6 - Added Youtube field (to open video on Youtube with predefined time)
// @history        0.0.5.2 - Fixed ?style=mine
// @history        0.0.5.1 - Fixed variables error
// @history        0.0.5 - Added support for Opera, removed alk.lv (invalid backup site long time ago)
// @history        0.0.4 - Added redirect to rucrash video player
// @namespace      http://ru_chp.livejournal.com/
// @description    improve video view in ru_chp (inspired with http://www.alk.lv/RU_CHP.user.js)
// @include        https://ru-chp.livejournal.com/*
// @include        https://ru_chp.livejournal.com/*
// @include        http://ru-chp.livejournal.com/*
// @include        http://ru_chp.livejournal.com/*
// @exclude        http://ru-chp.livejournal.com/ru_chp/*
// @grant          none
// ==/UserScript==
!function(win) {

	if (win.self != win.top) return;
	var doc = win.document;

	function append_form(element, url, form_content) {
		var form = doc.createElement("form");
		form.setAttribute("action", url);
		form.setAttribute("target", "_blank");
		form.innerHTML=form_content;

		element.appendChild(form);
	}

	function append_forms_by_id(element, id) {
		var ruchp_suffix = '/ruchp';
		var ruchp_suffix_ = ruchp_suffix  + '/';
		
		var rucrash_site = 'rucrash.com';
		var rucrash_video_url = 'http://video.' + rucrash_site + ruchp_suffix_ + id + ".mp4";
		text =
	'<input type="text" size="50" readonly="readonly" class="text" value="' + rucrash_video_url + '">' +
	'<input type="submit" class="submit" value="download from ' + rucrash_site + '" alt="Ok"> ';
		append_form(element, rucrash_video_url, text);

		var rucrash_player_url = 'http://www.' + rucrash_site + ruchp_suffix_;
		var text =
	'<input type="text" size="50" readonly="readonly" class="text" value="' + rucrash_player_url + '?v=' + id + '">' +
	'<input type="hidden" name="v" value="' + id + '">' +
	'<input type="submit" class="submit" value="play on ' + rucrash_site + '" alt="Ok"> ';
		append_form(element, rucrash_player_url, text);
	}

	function append_resolved_video(element, id_array) {
		// do not add videos NOT from Youtube
		var youtube_site, submit_button;
		var id = id_array.id;
		var time = id_array.time;
		var time_str = '';
		if (time != 0) {
			time_str = '&amp;t=' + time + 's'
		}
		if (id == undefined) {
			youtube_site = 'NOT a Youtube video';
		} else {
			youtube_site = 'http://www.youtube.com/watch?v=' + id + time_str;
			submit_button = '<input type="submit" class="submit" value="watch on Youtube" alt="Ok"> ';
		}
		text =
			'<input type="text" size="50" readonly="readonly" class="text" value="' + youtube_site + '">' +
			'<input type="hidden" name="v" value="' + id + '">' +
			(time_str != '' ? '<input type="hidden" name="t" value="' + time + 's">' : '') +
			(submit_button ? submit_button : '');
		append_form(element, youtube_site, text);
		return submit_button;
	}

	function append_resolved_videos(element, videos) {
		for (var i = 0; i < videos.length; i++) {
			if (! append_resolved_video(element, videos[i])) {
				// stop if no videos (for two or more videos)
				break;
			}
		}
	}

	function inlined_videos_count(element) {
		var videos = element.getElementsByTagName("iframe");
		if (videos && videos.length != 0) {
			return videos.length;
		} else {
			var hrefs = element.getElementsByTagName("a");
			var vcount = 0;
			for (var i = 0; i < hrefs.length; i++) {
				if (hrefs[i].getAttribute("class") && hrefs[i].getAttribute("class").indexOf("b-mediaplaceholder-video") > 0)
					vcount++;
			}
			return vcount;
		}
	}

	function convert_to_seconds(match, full_time) {
		if (full_time) {
			// regexp for "mm:ss"
			var minutes = parseInt(match[1]);
			var seconds = parseInt(match[2]);
		} else {
			// regexp for "N seconds"
			var minutes = 0
			var seconds = parseInt(match[1]);
		}
		seconds = 60 * minutes + seconds;
		return seconds;
	}

	function extract_times(element, videos) {
		var entry = null;
		var entries = element.parentNode.getElementsByClassName('entry-title');
		if (entries.length > 0) {
			for (var i = 0; i < entries.length; i++) {
				if (entries[i].getAttribute('class') == 'entry-title') {
					entry = entries[i].textContent;
					break;
				}
			}
		} else {
			// ?style=mine
			entries = element.parentNode.getElementsByClassName('b-singlepost-title');
			if (entries.length > 0) {
				entry = entries[0].textContent;
			}
		}
		videos = do_extract_times(entry, videos);
		entry = element.getElementsByClassName('entry-content');
		if (entry && entry[0]) {
			entry = entry[0].textContent;
		} else {
			// ?style=mine
			entry = element.textContent;
		}
		return do_extract_times(entry, videos);
	}

	function do_extract_times(entry, videos) {
		var match = null;
		var count = 0;
		// remove dates first
		entry = entry.replace(/\d+[:.-]\d+[:.-]\d+/, '');
		var times_re = /(\d{1,2})[:.-](\d{2})/g;
		var times_re_word = /с (\d+)(-?й? ?)?(сек|c\b)/ig;
		match = times_re.exec(entry);
		var full_time = true;
		if (!match) {
			times_re = times_re_word;
			full_time = false;
			match = times_re.exec(entry);
		}
		while (match != null) {
			var time = convert_to_seconds(match, full_time);
			if (videos[count]) {
				videos[count].time = time;
			}
			count++;
			match = times_re.exec(entry);
		}
		return videos;
	}

	function extract_youtube_url(src) {
		src = unescape(src);
		params = src.split('&');
		var id, source = undefined;
		for (var i = 0; i < params.length; i++) {
			key_value = params[i].split('=');
			if (key_value[0] == 'source') {
				source = key_value[1];
				if (source != 'youtube') {
					source = undefined;
				}
			} else if (key_value[0] == 'vid') {
				id = key_value[1];
			}
		}
		// if we do not know where source from
		if (source == undefined) {
			id = null;
		}
		return id;
	}

	function resolve_video_url(frame) {
		var url = frame.src;
		var result = { id: undefined, time: 0 };
		if (typeof frame == 'string') {
			url = frame;
		}
		result.id = extract_youtube_url(url);
		return result;
	}

	function get_resolved_videos(frames) {
		var result = new Array();
		for (var i = 0; i < frames.length; i++) {
			result[i] = resolve_video_url(frames[i]);
		}
		return result;
	}

	function get_inlined_videos(element) {
		var videos = element.getElementsByTagName("iframe");
		if (!(videos && videos.length != 0)) {
			var hrefs = element.getElementsByTagName("a");
			var videos = new Array();
			for (var i = 0; i < hrefs.length; i++) {
				if (hrefs[i].getAttribute("class") && hrefs[i].getAttribute("class").indexOf("b-mediaplaceholder-video") > 0)
					videos.push(hrefs[i].href);
			}
		}
		videos = get_resolved_videos(videos);
		videos = extract_times(element, videos);
		return videos;
	}

	function find_id(element, entry) {
		// if there are no videos
		// there is no reason to search id
		if (inlined_videos_count(entry) == 0)
			return false;
		var ruchp = "http://ru-chp.livejournal.com/";
		// if element is not document
		if (element.getElementById === undefined) {
			var as = element.getElementsByTagName("a")[0];
			as = as.getAttribute("href");
			// ensure that current post is in ru-chp
			if (as && as.indexOf(ruchp) == 0)
				return as.replace(ruchp, "").replace(".html", "");
		} else {
			// find in current open post
			var postform = element.getElementById("postform");
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
		var entry = doc.getElementById('b-sin-wrapper');
		article = doc.getElementsByClassName('b-singlepost-body')[0];
		// if single post view
		if (article) {
			id = find_id(doc, article);
			append_forms_by_id(article, id);
			videos = get_inlined_videos(article);
			append_resolved_videos(article, videos);
		} else {
			entries = doc.getElementsByTagName('div');
			for (var i = 0; i < entries.length; i++ ) {
				// find post
				var entry = entries[i];
				var id = false;
				// if community feed
				if (entry.getAttribute("style") == "text-align:left") {
					id = find_id(entry, entry);
				}
				if (id) {
					append_forms_by_id(entry, id);
					videos = get_inlined_videos(entry);
					append_resolved_videos(entry, videos);
				}
			}
		}
	}

	function append_in_own_style() {
		var entries = doc.getElementsByTagName('dl');
		// enumerate all <dl> tags
		for (var i = 0; i < entries.length; i++ ) {
			// find every post
			if (entries[i].getAttribute("class") == "entry hentry") {
				id = entries[i].id;

				var dds = entries[i].getElementsByTagName('dd');
				for (var j = 0; j < dds.length; j++ ) {
					entry = dds[j]
					if (entry.getAttribute("class") == "entry-text") {
						if (inlined_videos_count(entry) == 0)
							// if no videos, do not add any forms
							continue;
						// find post text
						id = id.replace("post-ru_chp-", "");
						append_forms_by_id(entry, id);
						videos = get_inlined_videos(entry);
						append_resolved_videos(entry, videos);
					}
				}
			}
		}
	}

	win.addEventListener("load", function() {
		// determine own/mine style
		// own community style has <html xmlns=""...
		mine_style = doc.getElementsByTagName("html")[0].getAttribute("xmlns") == null;
		// for own community view-style
		if (mine_style) {
			append_in_mine_style();
		} else {
			append_in_own_style();
		}
	}, false);

}(typeof unsafeWindow == 'undefined' ? window : unsafeWindow)
