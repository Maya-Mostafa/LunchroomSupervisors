"use strict";
requirejs.config({
    paths: {
        jquery: ["https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min", "lib/jquery"],
        "jquery-ui": "lib/jquery-ui"
    }
}), define(["jquery", "Lunchroom.Config", "PDSB.Rest"], function($, e, t) {
    var n = void 0,
        a = void 0,
        i = void 0,
        r = void 0,
        l = void 0,
        o = void 0,
        s = void 0,
        c = void 0,
        u = void 0,
        d = {},
        p = function(e) {
            require(["PDSB.Storage"], function(t) {
                t.Local.Set("Debug.Flowchart.State", e)
            })
        },
        f = function() {
            p("s"), v(), g(), h()
        },
        m = {
            all: function(e) {
                m.sticky(e)
            },
            sticky: function(e) {
                require(["lib/fixedsticky"], function() {
                    $(".fixedsticky").fixedsticky(), e && e()
                })
            }
        },
        v = function() {
            e.Current.year = $("#LRA__CurrentYear").val()
        },
        g = function() {
            p("lookUpCurrentUser"), require(["PDSB.Profile"], function(a) {
                a.FetchMeEmpLst(function(a) {
                    // e.Current.user.JobTitle = a.pdsbMyJobTitles; 
                    e.Current.user.JobTitle = a.MMHubJobTitle; 
                    var i = a.MMHubLocationNos,      //var i = a.pdsbMyDepartmentNos,
                        r = i.split(";"), //should this be ; or | ???
                        l = r.map(function(e) {
                            return "(Title eq '" + e + "')"
                        }),
                        o = "?$filter=" + l.join(" or ") + "&$select=ID,Title,School_x0020_Name";
                    t.Get(e.Endpoint.schools(o), function(t) {
                        var a = t.d.results;
                        for (var i in a) {
                            var r = a[i],
                                l = r.ID,
                                o = r.Title,
                                s = r.School_x0020_Name,
                                c = $(e.Template.locationDropdown(o, s));
                            d[o] = {
                                id: l,
                                name: s
                            }, "1666" === o && c.prop("selected", !0), c.appendTo($(n[1]))
                        }
                        $(n[1]).trigger("change"), e.Polling.liveUpdater = setInterval(function() {
                            e.Polling.enable && b.existing()
                        }, e.Polling.liveUpdaterInterval)
                    })
                })
            })
        },
        _ = {
            newUserPanel: function() {
                r.removeClass("existing").attr({
                    "data-pnum": null,
                    "data-email": null,
                    "data-name": null,
                    "data-name-first": null,
                    "data-name-last": null
                }).find(".LRA__Result__Profile__Status, .LRA__Add__Dyn").remove(), s.removeAttr("style"), l.val(""), c.html("")
            }
        },
        h = function() {
            n = $(e.Location), a = $(e.Results_Current), i = $(e.Results_Transferring), r = $(e.Add), l = $(e.Add__Input), o = $(e.Add__Submit), s = $(e.Add__Avatar), c = $(e.Add__Title), u = $(e.Add__Meta), n.on("change", function(t) {
                e.jLoc = $(t.currentTarget).val(), _.newUserPanel(), b.all()
            }).on("focus, click", function() {
                p("ioLocation")
            }).on("blur", function() {
                p("")
            }), S();
        },
        S = function() {
            require(["jquery-ui/widgets/autocomplete"], function() {
                l.val("").on("keyup", function(e) {
                    "" === $(e.currentTarget).val().trim() && _.newUserPanel()
                }).autocomplete({
                    minLength: 2,
                    open: function(e) {
                        $(".ui-autocomplete").width($(e.currentTarget).outerWidth()), u.val("")
                    },
                    source: function(n, a) {
                        var i = n.term.toLowerCase();
                        t.Get(e.Endpoint.userSearch(i), function(e) {
                            var t = e.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                            a($.map(t, function(e) {
                                var t = e.Cells.results,
                                    n = {};
                                for (var a in t) n[t[a].Key] = t[a].Value;
                                return {
                                    query: i,
                                    label: (n.RefinableString107.indexOf(';') != -1 ? n.RefinableString107.substring(0, n.RefinableString107.indexOf(';')) : n.RefinableString107 + ", " ) + (n.RefinableString106.indexOf(';') != -1 ? n.RefinableString106.substring(0, n.RefinableString106.indexOf(';')) : n.RefinableString106),
                                    meta: n,
                                    picture: n.PictureURL,
                                    pnum: "P" + n.EmpNumber.substring(2, n.EmpNumber.length),
                                    email: n.MMHubBoardEmailOWSTEXT,
                                    title: n.JobTitle,
                                    name: (n.RefinableString107.indexOf(';') != -1 ? n.RefinableString107.substring(0, n.RefinableString107.indexOf(';')) : n.RefinableString107 + ", " ) + (n.RefinableString106.indexOf(';') != -1 ? n.RefinableString106.substring(0, n.RefinableString106.indexOf(';')) : n.RefinableString106)
                                }
                            }))
                        })
                    },
                    select: function(t, n) {
                        var a = n.item.name.replace(/\[.*?\]/g, "").trim().split(/,\s+/),
                            i = void 0,
                            l = void 0;
                        i = a.length < 2 ? a[0] : a[1], l = a.length < 2 ? "" : a[0], _.newUserPanel(), n.item.picture && s.css("background-image", 'url("' + n.item.picture + '")'), c.html(n.item.title), r.children("fieldset, button").prop("disabled", !1), r.attr({
                            "data-pnum": n.item.pnum,
                            "data-email": n.item.email,
                            "data-name": n.item.label,
                            "data-name-first": i,
                            "data-name-last": l
                        }).addClass(e.Selector.ODStatusFetchRequest), $('[data-pnum="' + n.item.pnum + '"]').length > 1 ? r.removeClass(e.Selector.ODStatusFetchRequest).append($(e.Template.resultDuplicate(n.item.pnum))) : y("new-emp", [n.item], function() {
                            b.userODStatus()
                        })
                    }
                }).autocomplete("instance")._renderItem = function(e, t) {
                    var n = t.label.replace(new RegExp(t.query.trim().split(/\s+/g).join("|"), "gi"), "<strong>$&</strong>");
                    return $("<li>\n\t\t\t\t\t\t\t\t<span>" + n + "</span>\n\t\t\t\t\t\t\t</li>").appendTo(e)
                }
            })
        },
        T = {
            allocation: function() {
                var t = {
                        source: function(e) {
                            return 'input[id$="__Type-' + e + '"]:checked'
                        },
                        target: function(e) {
                            return '[data-ref="Allocation' + e + '"] .now'
                        }
                    },
                    n = ["ST", "ELP", "Sup", "BF", "SP"],
                    a = void 0;
                for (a in n) {
                    var i = $(t.source(n[a])),
                        r = $(t.target(n[a])),
                        l = r.siblings(".max:first"),
                        o = i.length,
                        s = l.text(),
                        c = o / s,
                        u = e.Allocation.occupancy;
                    if (r.text(i.length).attr("data-occupancy", ""), !isNaN(c))
                        for (var d = u.length - 1; d >= 0; d--)
                            if (c >= u[d].threshold) {
                                r.attr("data-occupancy", u[d].label);
                                break
                            }
                }
            }
        },
        b = {
            all: function() {
                e.Polling.liveUpdate = !1, b.current(function() {
                    return b.transferring(function() {
                        return b.allocation(function() {
                            return b.users(function() {
                                return b.allDone(function() {
                                    e.Polling.liveUpdate = !0
                                })
                            })
                        })
                    })
                })
            },
            allDone: function(t) {
                p("e"), $("#LRA").removeClass(e.Selector.fetchRequest), t && t()
            },
            allocation: function(n) {
                p("getAllocation"), t.Get(e.Endpoint.allocation(e.jLoc), function(e) {
                    //var t = e.d.results[0],
                    var tb4 = e.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length === 0 ? [] : e.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells.results,
                        n = void 0,
                        a = void 0,
                        i = void 0,
                        t = [{}];
                    for (var i in tb4){
                        var keyVal = tb4[i].Key;
                        if(keyVal.indexOf("Allocation") !== -1){
                            t[keyVal] = tb4[i].Value === "" ? null : parseInt(tb4[i].Value);
                        }
                    }
                    for (a in t) n = t[a], i = $('[data-ref="' + a + '"] .max'), i.text(n), n || i.closest(".allocation").addClass("no-allocation");
                    t || $(".allocation").addClass("no-allocation").children(".max").text(-1), T.allocation()
                }), n && n()
            },
            current: function(n) {
                p("getCurrent"), t.GetWToken(e.Endpoint.current(e.jLoc), function(e) {
                    //var t = $(e).find("GetLunchRoomSupByLocationResult").text(),
                    var t = e,
                        a = "No record found" === t ? [] : JSON.parse(t);

                    var userIp = $('#LRA__Location-OVERRIDE').val();

                    if (userIp != ""){
                        PDSB.Rest.Get("/HR/business/apppackages/_api/web/lists/GetByTitle('LunchroomApplication')/items?$filter=FormType eq 'Transferring' and SchoolLocationCode eq "+ userIp, function(locResults){
                            var ipLocResults = locResults.d.results;   
                            for (var i=0; i< ipLocResults.length; i++){
                                for (var j=0; j<a.length; j++){
                                    if (a[j].P_NUMBER == ipLocResults[i].MMHubEmployeeNo){
                                        PDSB.Rest.UpdateItem(ipLocResults[i].ID, 'LunchroomApplication', "/hr/business/apppackages/", "FormType", "Current")
                                    }
                                }
                            }
                            setTimeout(function(){
                                y("current-emp", a, function() {
                                    return b.existingCurrent(n)
                                })
                            }, 500);
                        })
                    }else{
                        y("current-emp", a, function() {
                            return b.existingCurrent(n)
                        })
                    }

                })
            },
            existing: function(n) {
                e.Polling.liveUpdate && (e.Polling.liveUpdate = !1, p("liveUpdate"), t.Get(e.Endpoint.existing(e.jLoc), function(t) {
                    var a = t.d.results;
                    e.Polling.liveUpdate = !0, R(a, n)
                }))
            },
            existingCurrent: function(n) {
                p("getExisting"), t.Get(e.Endpoint.existingCurrent(e.jLoc), function(e) {
                    var t = e.d.results;
                    R(t, n)
                })
            },
            transferring: function(n) {
                p("getTransfer"), t.Get(e.Endpoint.transferring(e.jLoc), function(e) {
                    var t = e.d.results;
                    y("transferring-emp", t, n)
                })
            },
            users: function(e) {
                b.userProfiles(function() {
                    return b.userODStatus(e)
                })
            },
            userProfiles: function(n) {
                p("getProfile");
                var a = {};
                $("." + e.Selector.profileFetchRequest).map(function(e, t) {
                    var n = $(t),
                        i = n.attr("data-pnum");
                    a[i] = n.children(".LRA__Result__Profile")
                });
                for (var i in a) t.Get(e.Endpoint.userProfile(i), function(t) {
                    var n = t.d.results[0],
                        i = "P" + n.MMHubEmployeeNo.substring(2), //i = n.AccountName.substring(4),
                        r = a[i];
                    //r.parent().removeClass(e.Selector.profileFetchRequest).attr("data-email", n.Email).attr("data-name", n.DisplayName), r.children(".LRA__Result__Profile__Name").text(n.DisplayName), n.PictureUrl && r.prepend(e.Template.profileAvatar(n.PictureUrl)), r.children(".LRA__Result__Profile__Title").text(n.Title)
                    r.parent().removeClass(e.Selector.profileFetchRequest).attr("data-email", n.MMHubBoardEmail).attr("data-name", n.FullName), r.children(".LRA__Result__Profile__Name").text(n.LastName+", "+n.FirstName), n.PictureUrl && r.prepend(e.Template.profileAvatar(n.PictureUrl)), r.children(".LRA__Result__Profile__Title").text(n.MMHubJobTitle)
                });
                $("." + e.Selector.profileFetchRequest).find(".LRA__Result__Profile__Title").text("Unable to retrieve user information, user does not exist in active directory."), n && n()
            },
            userODStatus: function(n) {
                p("getODStatus");
                var a = {};
                $("." + e.Selector.ODStatusFetchRequest).map(function(e, t) {
                    var n = $(t),
                        i = n.closest(".LRA__Result").attr("data-pnum");
                    a[i] = n.find(".LRA__Result__Profile")
                });
                for (var i in a) ! function(n) {
                    t.GetWToken(e.Endpoint.userODStatus(n), function(t) {
                        var i = t.odStatus,
                        //var i = t.GetCourseStatusResult.odStatus,
                            r = "FALSE" === i ? e.Selector.invalid : e.Selector.valid,
                            l = a[n];
                        l.parent().removeClass(e.Selector.ODStatusFetchRequest), l.prepend(e.Template.profileODStatus(r))
                    })
                }(i);
                n && n()
            }
        },
        y = function(n, l, o) {
            var s = void 0,
                c = void 0,
                u = (e.jLoc, void 0),
                f = void 0,
                v = void 0,
                g = void 0,
                h = void 0;
            switch (n = n || "current-emp") {
                case "current-emp":
                    p("popCurrent"), v = "Current", s = a, f = "P_NUMBER", u = !1;
                    break;
                case "transferring-emp":
                    p("popTransfer"), v = "Transferring", s = i, f = "MMHubEmployeeNo", u = !0;
                    break;
                case "new-emp":
                    v = "Transferring", s = r, f = "pnum", u = !1
            }
            switch (n) {
                /*case "current-emp":
                case "transferring-emp":
                    s.empty(), l.length > 0 ? $(e.Template.resultHeader()).appendTo(s) : $(e.Template.resultHeaderEmpty()).appendTo(s);
                    break;
                default:
                    s.find(".LRA__Result__Profile__Status, fieldset, button").remove();*/
                case "current-emp":
                    s.empty(), $(e.Template.resultHeaderAllocation()).appendTo(s);
                    t.Get(e.Endpoint.allocation(e.jLoc), function(data) {
                        //var t = data.d.results;
                        var tb4 = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results.length === 0 ? [] : data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells.results,
                            t = [{}];
                        for (var i in tb4){
                            var keyVal = tb4[i].Key;
                            if(keyVal.indexOf("Allocation") !== -1){
                                t[keyVal] = tb4[i].Value === "" ? null : parseInt(tb4[i].Value);
                            }
                        }
                        if(t.length !== 0){
                            s.find("#allocRegClasses").text(t.AllocationST === null ? 0 : t.AllocationST);
                            s.find("#allocEarlyLearn").text(t.AllocationELP === null ? 0 : t.AllocationELP);
                            s.find("#allocSupp").text(t.AllocationSup === null ? 0 : t.AllocationSup);
                            s.find("#allocSpNeeds").text(t.AllocationSP === null ? 0 : t.AllocationSP);
                        }
                    })
                    break;
                case "transferring-emp":
                    s.empty(), $(e.Template.resultHeaderAllocation()).appendTo(s);
                    s.find('.LRA__ResultHeader__2').prepend('<div>&nbsp;</div>')
                    s.find("#allocRegClasses").text('');
                    s.find("#allocEarlyLearn").text('');
                    s.find("#allocSupp").text('');
                    s.find("#allocSpNeeds").text('');
                    break;
                default:
                    ;
            }
            for (g in l) {
                switch (h = l[g], n) {
                    case "current-emp":
                        c = $(e.Template.result(h[f], n));
                        break;
                    case "transferring-emp":
                        var S = h.ApplicationType.results.join(";") === e.Selector.resign;
                        c = $(e.Template.result(h[f], n, h.ID)), c.toggleClass(e.Selector.immutable, S).children(".LRA__Send").prop("disabled", !0).children(".message").html(e.Template.sentOn(new Date(h.Modified)));
                        for (var y in h.ApplicationType.results) c.find('input[value="' + h.ApplicationType.results[y] + '"]').prop("checked", !0);
                        for (var y in h.ApplicationType.results) c.find('input[value="' + h.SelectedSchoolYear + '"]').prop("checked", !0);
                        break;
                    case "new-emp":
                        c = $(e.Template.resultNew(h[f]))
                }
                c.children("fieldset").prop("disabled", u), c.find("input").on("change", function(t) {
                    var n = $(t.currentTarget),
                        a = void 0;

                    if (n.val() === "CurrentYear" || n.val() === "NextYear")
                        n.siblings(":checked").prop("checked", !1), a = n.val();

                    if ("NotReturning" === n.val() || "Resign" === n.val()){
                        n.siblings(":checked").prop("checked", !1), a = n.val();
                    }
                    else{
                        n.siblings('[value="NotReturning"]:checked, [value="Resign"]:checked').prop("checked", !1);
                        a = n.siblings(":checked").addBack(":checked").map(function() {
                            return $(this).val()
                        }).get().join(";")
                    }

                    if (n.siblings(":checked").addBack(":checked").length > 0 ){
                        n.parent().attr("data-value", a).siblings(".LRA__Send").addClass(e.Selector.invalid).find('.LRA__Send__Update').removeClass('send-state');
                    }
                    else{
                        n.parent().attr("data-value", null).siblings(".LRA__Send").addClass(e.Selector.invalid).find('.LRA__Send__Update').removeClass('send-state');
                    }
                    if (n.siblings(":checked").addBack(":checked").length > 0 && n.parent().siblings('fieldset').children("input:checked").length > 0){
                        n.parent().attr("data-value", a).siblings(".LRA__Send").removeClass(e.Selector.invalid).find('.LRA__Send__Update').addClass('send-state');
                    }

                    T.allocation();
                }),
                c.find(".LRA__Send__Update").on("click", function(a) {
                    var i = $(a.currentTarget),
                        r = i.closest(".LRA__Result"),
                        l = r.children("fieldset"),
                        
                        lApp = r.children(".fieldsetApp"),
                        lYr = r.children(".fieldsetYr");
                    
                    $(this).removeClass('send-state');  

                    r.find(".LRA__Send");
                    if (l.prop("disabled")) l.prop("disabled", !1), l.children("input:checked").addClass("previously").prop("checked", !1);
                    else {
                        i.prop("disabled", !0), i.children(".active").text("Sending..."), l.prop("disabled", !0);
                        
                        var o = lApp.attr("data-value").split(";").splice(0, e.MAX_APPLICATION_TYPE);

                        var s = o[0] || "",
                            c = o[1] || "",
                            u = o[2] || "",
                            oYr = lYr.attr("data-value");

                        var p = function() {
                                t.Post(e.Endpoint.updateListItem(r.attr("data-id")), {
                                    headers: {
                                        "If-Match": "*",
                                        "X-HTTP-Method": "MERGE"
                                    },
                                    payload: {
                                        __metadata: {
                                            type: "SP.Data." + e.Current.listTrim() + "ListItem"
                                        },
                                        JobTitle: e.Current.user.JobTitle,
                                        ApplicationType: {
                                            __metadata: {
                                                type: "Collection(Edm.String)"
                                            },
                                            results: o
                                        },
                                        ApplicationType1: s,
                                        ApplicationType2: c,
                                        ApplicationType3: u,
                                        EmailSent: !1,
                                        SelectedSchoolYear : oYr
                                    }
                                }, function(t, a) {
                                    !1 === t ? i.text("Error!!!").prop("disabled", !1).addClass("tooltip").attr("data-title", a.message.value) : (i.prop("disabled", !1), i.children(".active").text("Send"), "new-emp" === n ? b.transferring(function() {
                                        return b.allocation(function() {
                                            return b.users(function() {
                                                return b.allDone(function() {
                                                    _.newUserPanel()
                                                })
                                            })
                                        })
                                    }) : (i.siblings(".message").html("Sent Recently"), l.attr("data-value") === e.Selector.resign && r.addClass(e.Selector.immutable), l.removeAttr("data-value").prop("disabled", !0).children(".previously").removeClass("previously")))
                                })
                            };
                        if (d[e.jLoc]) p(e.jLoc, d[e.jLoc].name);
                        else {
                            var f = "?$filter=Title eq '" + e.jLoc + "'&$select=ID,Title,School_x0020_Name&$top=1";
                            t.Get(e.Endpoint.schools(f), function(e) {
                                var t = e.d.results[0],
                                    n = t.ID,
                                    a = t.Title,
                                    i = t.School_x0020_Name;
                                d[a] = {
                                    id: n,
                                    name: i
                                }, p()
                            })
                        }
                    }
                }), c.find(".LRA__Send__Send").on("click", function(a) {
                    var i = $(a.currentTarget),
                        r = i.closest(".LRA__Result"),
                        l = r.find("fieldset"),
                        lYr = r.find(".fieldsetYr");
                    r.find(".LRA__Send");
                    if (void 0 === l.attr("data-value") || void 0 === lYr.attr("data-value")) e.EasterEgg.Select = e.EasterEgg.Select || {
                        timer: null,
                        counter: 0
                    }, clearTimeout(e.EasterEgg.Select.timer), e.EasterEgg.Select.timer = setTimeout(function() {
                        e.EasterEgg.Select.counter = 0
                    }, 500), ++e.EasterEgg.Select.counter > 20 && (e.EasterEgg.Select.counter = 0, l.children("label").css({
                        "background-image": "url(https://static.giantbomb.com/uploads/original/4/40549/2427147-slap_fight.gif)",
                        color: "#FFF"
                    })), l.stop(!0).fadeTo(150, .1).fadeTo(300, 1);
                    else {
                        i.prop("disabled", !0), i.children(".active").text("Sending..."), l.prop("disabled", !0);
                        var o = l.attr("data-value").split(";").splice(0, e.MAX_APPLICATION_TYPE),
                            s = o[0] || "",
                            c = o[1] || "",
                            u = o[2] || "",
                            oYr = lYr.attr("data-value");
                        var p = function(a, d) {
                                t.Post(e.Endpoint.newListItem, {
                                    payload: {
                                        __metadata: {
                                            type: "SP.Data." + e.Current.listTrim() + "ListItem"
                                        },
                                        Title: r.attr("data-email"),
                                        FormType: v,
                                        SchoolLocationCode: a,
                                        SchoolName: d,
                                        MMHubEmployeeName: r.attr("data-name"),
                                        MMHubEmployeeNo: r.attr("data-pnum"),
                                        FirstName: r.attr("data-name-first"),
                                        LastName: r.attr("data-name-last"),
                                        JobTitle: e.Current.user.JobTitle,
                                        ApplicationType: {
                                            __metadata: {
                                                type: "Collection(Edm.String)"
                                            },
                                            results: o
                                        },
                                        ApplicationType1: s,
                                        ApplicationType2: c,
                                        ApplicationType3: u,
                                        EmailSent: !1,
                                        SelectedSchoolYear : oYr
                                    }
                                }, function(e, t) {
                                    !1 === e ? i.text("Error!!!").prop("disabled", !1).addClass("tooltip").attr("data-title", t.message.value) : (i.prop("disabled", !1), i.children(".active").text("Send"), "new-emp" === n ? b.transferring(function() {
                                        return b.allocation(function() {
                                            return b.users(function() {
                                                return b.allDone(function() {
                                                    _.newUserPanel()
                                                })
                                            })
                                        })
                                    }) : (i.siblings(".message").html("Sent Recently"), l.removeAttr("data-value").prop("disabled", !0), b.existingCurrent()))
                                })
                            };
                        if (d[e.jLoc]) p(e.jLoc, d[e.jLoc].name);
                        else {
                            var f = "?$filter=Title eq '" + e.jLoc + "'&$select=ID,Title,School_x0020_Name&$top=1";
                            t.Get(e.Endpoint.schools(f), function(e) {
                                var t = e.d.results[0],
                                    n = t.ID,
                                    a = t.Title,
                                    i = t.School_x0020_Name;
                                d[a] = {
                                    id: n,
                                    name: i
                                }, p(a, i)
                            })
                        }
                    }
                }), c.appendTo(s)
            }
            m.all(), o && o()
        },
        R = function(t, n) {
            
            p("updateCurrent");
            var a = void 0,
                i = (e.jLoc, void 0),
                r = void 0,
                l = void 0,
                o = void 0;
            for (i in t) {
                
                r = t[i], l = r.ID, o = r.ApplicationType.results.join(";") === e.Selector.resign, a = $('[data-pnum="' + r.MMHubEmployeeNo + '"]'), a.attr("data-id", l).addClass("existing").toggleClass(e.Selector.immutable, o), a.children("fieldset").prop("disabled", !0).children("input").prop("checked", !1);
                
                for (var s in r.ApplicationType.results) a.find('input[value="' + r.ApplicationType.results[s] + '"]').prop("checked", !0);
                for (var s in r.ApplicationType.results) a.find('input[value="' + r.SelectedSchoolYear + '"]').prop("checked", !0);
                
                a.find(".LRA__Send .message").html(e.Template.sentOn(new Date(r.Modified)));
                var c = a.find(".LRA__Send__ResignLetter");
                
                //c.attr("href", c.attr("href").replace(/\?id=.+$/, "?id=" + l))                                
                if(c.attr('href') != undefined) {
					c.attr("href", c.attr("href").replace(/\?id=.+$/, "?id=" + l))
				}               	                
	            else{
	            	console.log("user does not exist: "+ l);
	            }	                
                
            }
            n && n()
        };
    $(function() {
        f();
    })
});
//# sourceMappingURL=./Lunchroom.js.map