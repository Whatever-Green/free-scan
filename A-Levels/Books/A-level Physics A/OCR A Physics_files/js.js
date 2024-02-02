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

$(function() {
  A5.LO_IFRAME_SIZE = [1005,695];
  A5.ANNOTATIONS_TOOLBOX = "Undo,Redo,Cursor,Pen,Highlighter,Eraser,StickyNote,Spotlight,Save,ClearAll,Hide,Clear";
  A5.ANNOTATIONS_VOCABULARY["en"] = {
    clearTool: 'Current page',
    clearAllTool: 'Whole title'
  };

  a5.dp.version = 'oxed-book-ebook-1.4.2';
  a5.dp.config.allowLOSelfClosing = false;
  //a5.dp.config.bookAnnotationsToolbarInsideBounds = true;
  //a5.dp.config.bookAnnotationsToolbarAppendTo = '.ebook .pages-wrapper';
  a5.dp.config.bookDialogModal = false;
  a5.dp.config.bookNotesAsTabPanel = false;
  a5.dp.config.bookNotesExportFormats = 'rtf, docx, pdf';
  a5.dp.config.bookPanelsType = 'sidebar';
  a5.dp.config.bookTooltipDelay = 1000;
  a5.dp.config.bookTooltipDuration = 4000;
  a5.dp.config.bookZoomMarqueeClick = 60;
  a5.dp.config.bookZoomMax = 200;
  a5.dp.config.bookZoomMin = false;
  a5.dp.config.bookZoomPreserve = false; // keep zoom after change page, default true (#8919)
  a5.dp.config.bookZoomSinglePage = 80;
  a5.dp.config.bookZoomStep = 20;
  a5.dp.config.protectBookPages = true;
  a5.dp.config.bookNotesAsTabPanel = true;
  a5.dp.config.bookNotesEditor = {
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
   };
  a5.dp.config.mousewheelActsAsPan = true;
  a5.dp.config.bookShowCurrentPagePlaceholder = true;

  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      a5.dp.config.bookNotesExportFormats = 'rtf';
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

$(function() {

  /**
   * space between the outermost buttons and page turn buttons to be calculated so that it’s twice the distance calculated for the space between the buttons and vertical dividers.
   * #7053
   */
  function calculeSpace() {
    var groups = $('.toolbar__tools').find('.group'),
        width = $(window).width() - 161,
        allGroupsWidth = 0,
        preSeparation = 0,
        separation = 0,
        spaces = groups.length * 2 + 2,
        minSeparation = 10,
        maxSeparation = 40;

    if (groups) {

      groups.each(function(index, el) {
        $(el).css({'padding-left': 0, 'padding-right': 0});
        allGroupsWidth += $(el).outerWidth();
      });

      preSeparation =  parseInt( (width - allGroupsWidth) / spaces);
      separation = preSeparation - 3;
      if (separation > maxSeparation) {
        separation = maxSeparation;
      } else if (separation < minSeparation) {
        separation = minSeparation;
      }

      // add paddings
      $('.toolbar__tools').css({'padding-left': separation, 'padding-right': separation});
      groups.css({'padding-left': separation, 'padding-right': separation});
    }
  }

  //listeners:
  a5.hooks.interactionShowed.add(calculeSpace);
  window.addEventListener('resize', calculeSpace);

  /**
   * MS Edge bug with centered text in an input txt with a place holder
   */
  function msInputBug(interaction) {
    $('.current-page').focusin(function () {
      $(this).attr('placeholder', '');
    });

    $('.current-page').focusout(function () {
      var txtval = $(this).attr('placeholder');
      if (txtval == "") {
          $(this).attr('placeholder', 'Go to page');
      }
    });
  }

  a5.hooks.interactionShowed.add( msInputBug );
});

(function($) {
  var layout = a5.dp.viewport = {
    init: function(interaction) {
      layout.hasViewport();
    },

    // Checks for `viewport` `<meta>` tag presence in the HTML's
    // head and if that is missing, injects a brand new `<meta>` tag
    // into the DOM ensuring the DOM's 100% scale at all times
    //
    hasViewport: function() {
      var paramaters = {
            'width': 1024,
            'user-scalable': 'no'
          },
          content = _.map(paramaters, function(value, key) { return key + '=' + value }).join(', '),
          $viewportMeta = $('meta[name=viewport]');

      if (!$viewportMeta.length) {
        $viewportMeta = $('<meta name="viewport">').appendTo('head');
      }

      $viewportMeta.attr('content', content);
    }
  };

  layout.init();
})(jQuery);

