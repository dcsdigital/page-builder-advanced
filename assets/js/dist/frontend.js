(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

( function( win, $, Tailor ) {

	'use strict';

	require( './shared/components/ui/video' );
	require( './shared/components/ui/stretch' );

	Tailor.initAdvancedElements = function() {

		$( '.tailor-section' ).each( function() {
			var $el = $( this );
			if ( this.classList.contains( 'js-stretch' ) ) {
				$el.tailorStretch();
			}
			else if ( this.classList.contains( 'js-stretch-content' ) ) {
				$el.tailorStretch( { retainContentWidth: false } );
			}
			if ( this.classList.contains( 'has-background-video' ) ) {
				var parallax = $el.data( 'tailorParallax' );
				if ( parallax ) {
					parallax.destroy();
				}
				$el.tailorVideo();
			}
		} );

		$( '.tailor-image' ).each( function() {
			var $el = $( this );
			$el.tailorLightbox();
		} );

		$( '[data-animation]' ).each( function() {
			var el = this;
			if ( '1' !== this.getAttribute( 'data-animation-repeat' ) ) {
				var waypoint = new Waypoint({
					element: el,
					handler: function() {
						el.classList.add( 'animated' );
						el.classList.add( el.getAttribute( 'data-animation' ) );
						el.removeAttribute( 'data-animation' );
						waypoint.destroy();
					},
					offset: 'bottom-in-view'
				} )
			}
			else {
				new Waypoint.Inview( {
					element: el,
					enter: function( direction ) {},
					entered: function( direction ) {
						el.classList.add( 'animated' );
						el.classList.add( el.getAttribute( 'data-animation' ) );
					},
					exit: function( direction ) {},
					exited: function( direction ) {
						el.classList.remove( 'animated' );
						el.classList.remove( el.getAttribute( 'data-animation' ) );
					}
				} );
			}
		} );
	};

	$( document ).ready( function() {
		Tailor.initAdvancedElements();
	} );

} ) ( window, window.jQuery, window.Tailor || {} );
},{"./shared/components/ui/stretch":2,"./shared/components/ui/video":3}],2:[function(require,module,exports){
/**
 * Tailor.Components.Stretch
 *
 * A component used to stretch sections.
 *
 * @class
 */
var $ = window.jQuery,
    Components = window.Tailor.Components,
    Stretch;


Stretch = Components.create( {

    getDefaults : function () {
        return {
            retainContentWidth : true
        };
    },

	/**
     * Initializes the component.
     *
     * @since 1.0.1
     */
    onInitialize : function () {
        this.parent = this.el.parentNode;
        this.content = this.$el.children( '.tailor-section__content' ).get( 0 );
        
        this.applyStyles();
    },

	/**
     * Refreshes styles when the screen is resized.
     *
     * @since 1.0.1
     */
    onResize: function() {
        this.refreshStyles();
    },

	/**
     * Apply styles to the Section and its content.
     *
     * @since 1.0.1
     */
    applyStyles: function() {
        var rect = this.el.getBoundingClientRect();
        var width = rect.width;
        var left = rect.left;

        this.el.style.width = window.innerWidth + 'px';
        this.el.style.marginLeft = - left + 'px';

        if ( this.options.retainContentWidth ) {
            this.content.style.maxWidth = width + 'px';
            this.content.style.marginLeft = left + 'px';
        }
        else {
            this.content.style.width = '100%';
            this.content.style.marginLeft = '0px';
        }
    },

	/**
     * Resets styles for the Section and its content.
     *
     * @since 1.0.1
     */
    resetStyles : function() {
        this.el.style = '';
        this.content.style = '';
    },

	/**
	 * Refreshes styles for the Section and its content.
     *
     * @since 1.0.1
     */
    refreshStyles: function() {
        this.resetStyles();
        this.applyStyles();
    }

} );

$.fn.tailorStretch = function( options, callbacks ) {
    return this.each( function() {
        var instance = $.data( this, 'tailorStretch' );
        if ( ! instance ) {
            $.data( this, 'tailorStretch', new Stretch( this, options, callbacks ) );
        }
    } );
};

module.exports = Stretch;
},{}],3:[function(require,module,exports){
/**
 * Tailor.Components.Video
 *
 * A video background component.
 *
 * @class
 */
var $ = window.jQuery,
    Components = window.Tailor.Components,
    Video;

var youTubeScriptAdded = false;
var youTubeApiReady = 'undefined' != typeof window.YT;
var youTubePlayers = [];

/**
 * Creates a new YouTube player.
 * 
 * @since 1.0.0
 * 
 * @param el
 * @param videoId
 * @param callback
 */
function createYouTubePlayer( el, videoId, callback ) {
    if ( ! youTubeApiReady ) {
        if ( ! youTubeScriptAdded ) {
            var tag = document.createElement( 'script' );
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );
            youTubeScriptAdded = true;
        }
        youTubePlayers.push( [ el, videoId, callback ] );
    }
    else {
        var player = new YT.Player( el, {
            height: '390',
            width: '640',
            videoId: videoId,
            playerVars: {
                enablejsapi: 1,
                playsinline: 1,
                modestbranding : 1,
                rel : 0,
                showsearch : 0,
                showinfo: 0,
                autoplay: 1,
                controls : 0,
                loop : 1,
                playlist: videoId
            },
            events: {
                'onReady': function() {
                    player.mute();
                    if ( 'function' == typeof callback ) {
                        callback.call( player );
                    }
                }
            }
        } );
    }
}

/**
 * Creates new YouTube youTubePlayers when the API is available.
 * 
 * @since 1.0.0
 */
window.onYouTubeIframeAPIReady = function() {
    youTubeApiReady = true;
    if ( youTubePlayers.length ) {
        _.each( youTubePlayers, function( player ) {
            createYouTubePlayer( player[0], player[1], player[2] );
        } )
    }
};

var vimeoScriptAdded = false;
var vimeoApiReady = false;
var vimeoPlayers = [];

/**
 * Creates a new Vimeo player.
 *
 * @since 1.0.0
 *
 * @param el
 * @param videoId
 * @param callback
 */
function createVimeoVideo( el, videoId, callback ) {
    if ( ! vimeoApiReady ) {
        if ( ! vimeoScriptAdded ) {
            var script = document.createElement( 'script' );
            script.setAttribute( 'type', 'text/javascript' );
            script.setAttribute( 'src', 'https://player.vimeo.com/api/player.js' );
            document.getElementsByTagName( 'head' ).item(0).appendChild( script );
            script.addEventListener( 'load', onVimeoAPIReady, false );
            vimeoScriptAdded = true;
        }
        vimeoPlayers.push( [ el, videoId, callback ] );
    }
    else {
        var options = {
            id: videoId,
            width: 640,
            autoplay: true,
            loop: true,
            title: false
        };

        var player = new Vimeo.Player( el, options );
        player.setVolume(0);
        player.on( 'loaded', function() {
            if ( 'function' == typeof callback ) {
                callback.call( player );
            }
        } );
    }
}

/**
 * Creates new Vimeo youTubePlayers when the API is available.
 *
 * @since 1.0.0
 */
window.onVimeoAPIReady = function() {
    vimeoApiReady = true;

    if ( vimeoPlayers.length ) {
        _.each( vimeoPlayers, function( player ) {
            createVimeoVideo( player[0], player[1], player[2] );
        } )
    }
};

Video = Components.create( {

    video: false,

    onInitialize: function() {
        var video = this.el.querySelector( '.tailor-video' );
        if ( video ) {
            video.id = this.id;
            if ( video.classList.contains( 'tailor-video--youtube' ) ) {
                createYouTubePlayer( video, video.getAttribute( 'data-video-id' ), this.initVideo.bind( this ) );
            }
            else if ( video.classList.contains( 'tailor-video--vimeo' ) ) {
                createVimeoVideo( video, video.getAttribute( 'data-video-id' ), this.initVideo.bind( this ) );
            }
            else {
                this.initVideo();
            }
        }
    },

	/**
     * Initializes the video background.
     * 
     * @since 1.0.0
     */
    initVideo : function() {
        this.video = document.getElementById( this.id );
        this.fitVideo();
    },

	/**
     * Fits the video to the section.
     * 
     * @since 1.0.0
     */
    fitVideo : function() {
        if ( ! this.video ) {
            return;
        }

        var sectionWidth = this.el.offsetWidth;
        var sectionHeight = this.el.offsetHeight;
        var videoWidth = 16;
        var videoHeight = 9;

        if ( ( sectionWidth / sectionHeight ) < ( videoWidth / videoHeight ) ) {
            var width = ( sectionHeight / videoHeight ) * videoWidth;
            this.video.style.top = '';
            this.video.style.left = -( width - sectionWidth ) / 2 + 'px';
            this.video.style.height = sectionHeight + 'px';
            this.video.style.width = width + 'px';
        }
        else {
            var height	= ( sectionWidth / videoWidth ) * videoHeight;
            this.video.style.top = -( height - sectionHeight ) / 2 + 'px';
            this.video.style.left = '';
            this.video.style.height = height + 'px';
            this.video.style.width = '100%';
        }
    },

    /**
     * Element listeners
     */
    onJSRefresh: function() {
        this.fitVideo();
    },

    onDestroy: function() {
        this.video.removeAttribute('style');
    },
    
    /**
     * Child listeners
     */
    onChangeChild: function() {
        this.fitVideo();
    },
    
    /**
     * Descendant listeners
     */
    onChangeDescendant: function() {
        this.fitVideo();
    },

    /**
     * Window listeners
     */
    onResize: function() {
        this.fitVideo();
    }
    
} );

/**
 * Video background jQuery plugin.
 *
 * @since 1.0.0
 *
 * @param options
 * @param callbacks
 * @returns {*}
 */
$.fn.tailorVideo = function( options, callbacks ) {
    return this.each( function() {
        var instance = $.data( this, 'tailorVideo' );
        if ( ! instance ) {
            $.data( this, 'tailorVideo', new Video( this, options, callbacks ) );
        }
    } );
};

module.exports = Video;
},{}]},{},[1]);
