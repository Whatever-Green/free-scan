+function() {
  a5.callbacks.interaction.bind('showed', function(interaction) {
    $('#annotations-toolbox').children('.tool-clear, .tool-clearAll').
                              wrapAll('<li class="menu menu-clear" title="Clear Annotations Menu"><ul></ul>').
                              parent().before('<span class="name">Clear all</span>').
                              parent().on('click', function(ev) {
        $(this).addClass('active').removeClass('to-left');
        if ($(this).children('ul').get(0).getBoundingClientRect().right > window.innerWidth) {
          $(this).addClass('to-left');
        }
        if ($(ev.target).closest('ul').is('#annotations-toolbox')) {
          ev.stopPropagation();
        }
    });
    $('#annotations-toolbox').on('click', function() {
      $(this).find('.menu').removeClass('active');
    });
  });
}();

$(function() {
  function openCKToolbar() {
    $('.cke_extend').toggleClass('active');
    $('.cke').toggleClass('extended');
  }

  a5.eventBus.bind('lo:ready', function(data) {
    CKEDITOR.on('instanceCreated', function(e) {
      e.editor.on('key', function(event) {
        if (event.data.keyCode === CKEDITOR.ALT + 121) { // ALT + F10
          openCKToolbar();
        }
      });

      e.editor.on('mode', function(e) {
        var parent = e.editor.element.$.parentNode;
        if (!$('.cke_extend', parent).length) {
          $(".cke_top", parent).append('<a class="cke_extend"><span class="cke_extend_icon"></span></a>');
        }
      });
    });
  });

  $(document).on('click', '.cke_extend', openCKToolbar);
});

/* Check mutation observer on hotspots for more changes */

$(function() {
  $('body').on('hidden.bs.modal', function () {
    window.getSelection().removeAllRanges();
    $('.link-help a').focus();
  });
});

// INFO

a5.dp.info = {
  engine: a5.Engine.version || 'development',
  root: 'oxed-book-ebook-1.5.3'
};


// ENGINE CONFIGURATION VARIABLES

A5.LO_IFRAME_SIZE = [1005,695];
A5.ANNOTATIONS_TOOLBOX = 'Undo,Redo,Cursor,Pen,Highlighter,Eraser,StickyNote,Spotlight,Save,ClearAll,Hide,Clear';
A5.ANNOTATIONS_VOCABULARY['en'] = {
  clearTool: 'Current page',
  clearAllTool: 'Whole title'
};

_.extend(a5.dp.config, {
  allowLOSelfClosing: false,                                              // LO tries to close its window on click the close icon except if a redirection happens earlier (e.g LOCloseRedirect, LOFinishRedirect url params)
  bookDialogModal: false,                                                 // Display the TOC, Bookmarks, Notes popup as modals
  bookNotesExportFormats: 'rtf, docx, pdf',                               // comma separated list with the allowed export formats for the book notes
  bookPanelsType: 'sidebar',                                              // opens TOC, Bookmarks, Notes and Resources panels as dialog or as sidebar
  bookTooltipDelay: 1000,                                                 // displays the tooltip after the delay time (milisecs)
  bookTooltipDuration: 4000,                                              // keeps the tooltip visible during the duration time (milisecs)
  bookZoomMarqueeClick: 60,                                               // Default % zoom step for digital books when the marquee click tool is used
  bookZoomMax: 200,                                                       // % allowed max zoom. By default will be the original image width
  bookZoomMin: false,                                                     // % allowed min zoom. By default will fit the window height
  bookZoomPreserve: false,                                                // Preserves zoom level between pages
  bookZoomSinglePage: 80,                                                 // Default % initial zoom for the single page mode. If false, the page will fit the window.
  bookZoomPinchStep: 5,                                                   // Default % zoom step for digital books on pinch gesture
  bookZoomStep: 20,                                                       // Default % zoom step for digital books
  protectBookPages: true,                                                 // Disables the context menu (right click menu) for digital books
  bookNotesAsTabPanel: true,                                              // display the notes as a tab panel
  bookNotesEditor: {                                                      // ckeditor custom config for the book notes
    toolbar: [
      {name: 'styles', items: ['Styles', 'Format']},
      '/',
      {name: 'clipboss', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', 'Undo', 'Redo']},
      '/',
      {name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'RemoveFormat', 'Superscript', 'Subscript']},
      '/',
      {name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'Link', 'Unlink', 'Anchor']}
    ],
      removeButtons: ''
    },
  mousewheelActsAsPan: true,                                              // Wether to pan ebooks or alter zoom
  bookShowCurrentPagePlaceholder: true                                    // Displays the current page in the go to page box instead of the placeholder
});

$(function() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera,
      androidPhone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i, // Match 'Android' AND 'Mobile'
      iOSPhone = /iPhone/i,
      iOS = /iPad|iPhone|iPod/i;

  if (iOS.test(userAgent) && !window.MSStream) {
    a5.dp.config.bookNotesExportFormats = 'rtf';
  }

  if (iOSPhone.test(userAgent) || androidPhone.test(userAgent) && !window.MSStream) {
    a5.dp.config.bookZoomPinchStep = 1;
  }
});

+function() {
  var $iframe, $backdrop;

  var oldExtOpen = a5.views.interaction.PPEbookHotspotExternal.prototype.open;
  a5.views.interaction.PPEbookHotspotExternal.prototype.open = function() {
    oldExtOpen.apply(this, arguments);

    if (typeof this.$iframe === "undefined") {
      commonSetup($('.interactive-dialog'));
    } else {
      commonSetup(this.$iframe);
    }

  };

  var oldPlatOpen = a5.views.interaction.PPEbookHotspotPlatform.prototype.open;
  a5.views.interaction.PPEbookHotspotPlatform.prototype.open = function() {
    oldPlatOpen.apply(this, arguments);
    commonSetup(this.$iframe);
  };

  function commonSetup(this$iframe) {
    if (this$iframe) {
      $iframe = this$iframe;
      $(window).on('resize', resizeIframe);
      resizeIframe();

      /* EDGE Fix Mutation observer */

      var target = $iframe[0];
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          var nodes = Array.from(mutation.removedNodes);
          var directMatch = nodes.indexOf(target) > -1
          var parentMatch = nodes.some(function(parent) { parent.contains(target) });

          if (directMatch || parentMatch) {
            window.getSelection().removeAllRanges();
            $('.link-help a').focus();
          }
        });
      });

      var config = {
        subtree: true,
        childList: true
      };

      observer.observe(document.body, config);
    }
  }

  function resizeIframe() {
    var width, height,
        scale = Math.min($(window.top).width() / A5.LO_IFRAME_SIZE[0],
                         $(window.top).height() / A5.LO_IFRAME_SIZE[1]);
    if (scale < 1) {
      $('.neat-ios-fix:last').css('transform', 'scale(' + scale + ')');
      width = $(window.top).width() / scale;
      height = $(window.top).height() / scale;
    } else {
      $('.neat-ios-fix:last').css('transform', '');
      width = $(window.top).width();
      height = $(window.top).height();
    }
  }
}();

+function() {
  a5.hooks.ppebookRendered.add(function(book) {
    var scroller = book.pages.scroller;
    scroller.bind('zoom_changed', function() {

      var hotspot = scroller.node.find('.hotspot');

      hotspot.find('.tooltip').css('transform', '').each(function() {
        var $tooltip = $(this),
            transform = $tooltip.css('transform');
        if (transform === 'none') {
          transform = '';
        } else {
          transform = ' ' + transform;
        }
        $tooltip.css('transform', 'scale(' + 1 / scroller.zoom + ') translate3d(0,0,0)' + transform);
        $tooltip.css('z-index', '1502')
      });
    });
  });
}();

$(function() {
  $(document.body).toggleClass('isMobile', /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  a5.callbacks.interaction.bind('showed', function() {
    $('.ebook').data('mvc-view').model.bind('page_change', function() {
      // TODO remove this when #12468 has been merged and released in the engine
      $('#audio-toolbar .stop').click();
    });
  });
});

(function($) {
  var layout = a5.dp.viewport = {
    init: function( interaction ) {
      layout.hasViewport();
    },

    // Checks for `viewport` `<meta>` tag presence in the HTML's
    // head and if that is missing, injects a brand new `<meta>` tag
    // into the DOM ensuring the DOM's 100% scale at all times
    //
    hasViewport: function() {
      var paramaters = {
        'width': 'device-width',
        'height': 'device-height',
        'initial-scale': 1,
        'minimum-scale': 1,
        'maximum-scale': 1,
        'user-scalable': 'no',
        'viewport-fit': 'cover'
      };
      var content = _.map( paramaters, function(value, key){ return key+'='+value } ).join(', '),
          $viewportMeta = $('meta[name=viewport]');

      if ( !$viewportMeta.length ) $viewportMeta = $('<meta name="viewport">').appendTo('head');

      $viewportMeta.attr('content', content );
    }
  }
  a5.callbacks.interaction.bind('loaded', layout.init, this, { once: true });
})(jQuery);

+function() {
  var engine = a5.Engine.getInstance(),
      book = engine.getBook();

  book.ready().then(function() {
    var breakpoint = '',
        DESKTOP_BREAKPOINT = 988;

    var updateBreakpoint = function() {
      var viewportWidth = window.innerWidth > 0 ? window.innerWidth : screen.width;

      if (breakpoint === 'mobile' && viewportWidth >= DESKTOP_BREAKPOINT) {
        book.setPagesPerScreen(2);
        breakpoint = 'desktop';
        console.log("Breakpoint updated to " + breakpoint);
      } else if ((breakpoint != 'mobile' || breakpoint === '') && viewportWidth < DESKTOP_BREAKPOINT) {
        book.setPagesPerScreen(1);
        breakpoint = 'mobile';
        console.log("Breakpoint updated to " + breakpoint);
      }
    };

    updateBreakpoint();

    $(window).on('resize', _.debounce(updateBreakpoint, 200));
  });
}();

