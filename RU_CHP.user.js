// ==UserScript==
// @name           RU_CHP
// @namespace      http://ru_chp.livejournal.com/
// @description    improve video view in ru_chp
// @include        http://ru-chp.livejournal.com/*
// @exclude        http://ru-chp.livejournal.com/ru_chp/*
// ==/UserScript==

//alert(document.location);

text =
'<input type="hidden" name="journal" value="ru_chp">' +
'<fieldset>' +
'<input type="text" name="url" id="ruchpPostUrl" readonly="readonly" class="text" value="'+document.location+'">' +
'</fieldset>' +
'<fieldset>' +
'<input type="submit" class="submit" alt="Ok"> ' +
'</fieldset>';





var lj_controlstrip_new = document.getElementById("lj_controlstrip_new");

var form = document.createElement("form");
form.setAttribute("class", "w-cs-search");
form.setAttribute("action", "http://www.alk.lv/ruchp");
form.innerHTML=text;


for( var elem = lj_controlstrip_new.firstElementChild; elem!=null; elem=elem.nextElementSibling ){    
        grp = elem.getAttribute("class");
        if ( grp == "w-cs-user-controls"){
			elem.appendChild(form);
			break;
        }
}



