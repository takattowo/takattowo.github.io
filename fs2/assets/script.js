(function() {
  var urls = ['alice', 'alice2', 'alice3', 'coyote', 'ginger', 'hikari', 'king', 'liu', 'marion', 'marion2'];
  function swap() {
    document.getElementById('waifu').setAttribute('src', '/fs2/assets/' + urls[Math.round(Math.random() * urls.length)] + '.png');
	  
  }

  // Mozilla, Opera and webkit nightlies currently support this event
  if ( document.addEventListener ) {
    window.addEventListener( 'load', swap, false );
  // If IE event model is used
  } else if ( document.attachEvent ) {
    window.attachEvent( 'onload', swap );
  }
})();	
	function ImgError(source){
	source.src = "/fs2/assets/coyote.png";
	source.onerror = "";
	return true;
}
