<div class="slide-container" number="<%= typeof(number)!== 'undefined' ?  number : '' %>">

    <img class="slide_image" src="<%= background %>" height="<%= height %>px" width="<%= width %>px" />

    <% if (typeof(text) !== "undefined" && typeof(font) !== "undefined") { %>
    <div class="slide_text" style='font-family: "<%= font %>"'>
	<span><%= text %></span>
    </div>
    <% } %>


</div>