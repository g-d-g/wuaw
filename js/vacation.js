(function() {

  function Vacation() {
    this.loadStaff();
  }

  Vacation.prototype.loadStaff = function() {
    var self = this;
    self.loadingMessage(true);
    $.getJSON('js/responses/staff.json', function(data) {
      self.loadingMessage(false);
      var staff = [];
      for (var i in data) {
        staff.push(data[i].name);
      }
      var input = document.getElementById("staff");
      var vacationbutton = document.getElementById("getvacation");
      new Awesomplete(input, {
        list: staff,
      });

      // enable get button when valid value is selected, and set userid
      input.addEventListener('awesomplete-selectcomplete', function() {
        var index = $.inArray(this.value, staff);
        self.userid = data[index].id;
        vacationbutton.disabled = false;
      });

      // disable get button until valid value is selected
      input.addEventListener('keydown', function(e) {
        if (e.keyCode !== 13) {
          vacationbutton.disabled = true;
        }
      });

      // click handler for get button
      $('#getvacation').click(function() {
        self.loadVacation();
      });

      // show login
      self.clearAlerts();
      $('.jumbotron').slideDown('fast');

    }).fail(function() {
      self.setError('Communication error');
    });
  }

  Vacation.prototype.loadVacation = function() {
    var self = this;
    self.loadingMessage(true);
    $.getJSON('js/responses/range.json', { userid: self.userid }, function(data) {
      self.loadingMessage(false);
      $('.jumbotron').slideUp('fast');
      self.clearAlerts();
      self.renderWeeks(data);

    }).fail(function() {
      self.setError('Communication error');
    });
  }

  Vacation.prototype.renderWeeks = function(data) {
    var self = this;
    $('#header h3').text(document.getElementById("staff").value);
    $('#header').show();
    var template = [];
    for (var i = 0; i < data.length; i++) {
      var week = data[i].weekNumber,
          year = data[i].weekYear,
          checked = data[i].checked,
          edited = '',
          glyphicon = 'glyphicon-check';

      $(checked).each(function(index) {
        if (checked[index].check) {
          edited = ' edited';
          glyphicon = 'glyphicon-remove';
        }
      });

      template.push('<div class="col-xs-12 col-sm-6 col-md-3">' +
                      '<div class="week' + edited + '">' +
                        '<h3><a href="javascript:selectAll(' + week + ');">Week ' +
                        week +
                        ' <span class="glyphicon ' + glyphicon + '" aria-hidden="true"></span></a></h3>' +
                        this.checkBoxTemplate(week, year, checked) +
                      '</div>' +
                    '</div>'
      );
    }

    // Delay week display for animation effect
    $(template).each(function(index) {
      setTimeout(function() {
        $('#weeks').append(template[index]);
      }, 150 * index);
    });

    var enableButtons = setInterval(function() {
      if ($('.week').length === template.length) {
        clearInterval(enableButtons);
        $('#close').prop('disabled', false);
      }
    }, 500);

    $('#weeks').on('change', 'input[type="checkbox"]', function() {
      $('.week').removeClass('edited');
      $('input[type="checkbox"]:checked').each(function(index, elem) {
        $(elem).parents('.week').addClass('edited');
      });
      toggleIcon($(this).parents('form[data-week]').attr('data-week'));
      $('#save').prop('disabled', false);
      $('#header .badge').text($('input[type="checkbox"]:checked').length);
      self.clearAlerts();
    });
  }

  Vacation.prototype.clearAlerts = function() {
    $('#alerts').html('');
  }

  Vacation.prototype.setError = function(error) {
    $('#alerts').html('<div class="alert alert-danger" role="alert">' + error + '</div>');
  }

  Vacation.prototype.loadingMessage = function(on) {
    if (on) {
      $('#alerts').html('<div class="alert alert-info" role="alert">Loading...</div>');
    } else {
      $('#alerts').html('');
    }
  }

  Vacation.prototype.checkBoxTemplate = function(week, year, checked) {
    var weekDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    var template = '<form data-week="' + week + '" data-year="' + year + '">';
    for (var w = 0; w <= 4; w++) {
      var setcheck = '';
      if (checked && checked[w].check) {
        setcheck = 'checked';
      }
      template += '<div class="checkbox"><label>';
      template += '<input type="checkbox" name="' + w + '" ' + setcheck + '> <span>' + weekDay[w] + ' ' +
      moment([year]).startOf('isoWeek').week(week).add(w, 'day').format('D/M');
      template += '</span></label></div>';
    }
    template += '</form>';
    return template;
  }

  $(document).ready(function() {
    $.ajaxSetup({ cache: false });
  });

  $('#close').click(function() {
    var close = true;
    if (!$('#header .badge').is(':empty')) {
      close = window.confirm('You have unsaved changes. Close anyway?');
    }
    if (close) {
      $('#weeks').off().html('');
      vacation.clearAlerts();
      $('#header').hide();
      $('#header .badge').text('');
      $('#save, #close').prop('disabled', true);
      $('.jumbotron').slideDown('fast');
    }
  });

  $('#save').click(function() {
    vacation.loadingMessage(true);

    // construct json savedata
    var jsonsave = [];
    $('.week form').each(function() {
      var checked = [];
      $(this).find('input[type="checkbox"]').each(function() {
        if ($(this).prop('checked')) {
          checked.push({'check': 1});
        } else {
          checked.push({'check': 0});
        }
      });
      jsonsave.push({'weekNumber': $(this).attr('data-week'),
                     'weekYear': $(this).attr('data-year'),
                     'checked': checked});
    });

    // send json save data
    $.getJSON('js/responses/save.json', { userid: vacation.userid, savedata: jsonsave }, function(data) {
      vacation.loadingMessage(false);
      if (data[0].status && data[0].status === 'OK') {
        var message = 'Vacation saved!';
        $('#alerts').html('<div class="alert alert-success" role="alert">' + message + '</div>');
        $('#header .badge').text('');
        $('#save').prop('disabled', true);
      } else {
        vacation.setError('Not saved. Please try again.');
      }
    }).fail(function() {
      vacation.setError('Communication error');
    });
  });

  var vacation = new Vacation();

})();

// functions called from inline js
function selectAll(form) {
  $thisForm = $('form[data-week="' + form + '"]');
  if ($thisForm.find('input[type="checkbox"]:checked').length) {
    $thisForm.find('input[type="checkbox"]').prop('checked', false).trigger('change');
  } else {
    $thisForm.find('input[type="checkbox"]').prop('checked', true).trigger('change');
  }
  toggleIcon(form);
}

function toggleIcon(form) {
  $thisForm = $('form[data-week="' + form + '"]');
  if ($thisForm.parents('.week').hasClass('edited')) {
    $thisForm.parents('.week').find('.glyphicon').addClass('glyphicon-remove').removeClass('glyphicon-check');
  } else {
    $thisForm.parents('.week').find('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-check');
  }
}