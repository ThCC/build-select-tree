/**
 * Build Select Tree - Component to create a dropdown that contains a tree-view
 * @version v0.4.0 - 2013-08-09
 * @link https://github.com/ThCC/build-select-tree
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

angular.module('bst.config', []).value('bst.config', {});
angular.module('bst.directives', ['bst.config']);
angular.module('bst', ['bst.directives', 'bst.config']);

 /**
 * @param [config] {mixed} Has to be provided a set of configurations to build the tree. 
 * Questions about the collection of settings to see documentation: https://github.com/ThCC/build-select-tree/blob/master/README.md
 * If the documentation does not answer your questions, feel free to open issues or pull requests.
 */
angular.module('bst.directives').directive('bstBuildSelectTree', ['$document', '$rootScope', function ($document, $rootScope) {

    return {
        restrict: 'E',
        scope: {
            config: '='
        },
        priority: 25,
        template: '<div id={{selectTreeId}} style="display: inline-block;">' +
            '<div class="buildselect">' +
            '<button class="btn" ng-disabled="config.disabled" ng-click="toggleSelect()">' +
            '<span class="pull-left">{{btnLabel}}</span>' +
            '<span class="caret pull-right"></span>' +
            '</button>' +
            '<div class="buildselect-wrapper" ng-show="isVisible">' +
            '<bst-select-tree ng-model="config.tree"></bst-select-tree>' +
            '</div>' +
            '</div>' +
            '</div>',
        replace: true,
        controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
            $scope.titlesList = [];
            $scope.selectTreeId = $scope.config.selectTreeId !== undefined ? $scope.config.selectTreeId : "defaultId";
            $scope.labelBtn = {
                defaultName: $scope.config.labelBtn.defaultName !== undefined ? $scope.config.labelBtn.defaultName : "Selecione...",
                multi: $scope.config.labelBtn.multi !== undefined ? $scope.config.labelBtn.multi : "Selecionados: "
            };
            $scope.maxBtnLabels = $scope.config.maxBtnLabels !== undefined ? $scope.config.maxBtnLabels : 2;
            if ($scope.config.preChecked === undefined)
                $scope.config.preChecked = [];
            if ($scope.config.postChecked === undefined)
                $scope.config.postChecked = [];
            if ($scope.config.noneChecked === undefined)
                $scope.config.noneChecked = true;
            $scope.btnLabel = $scope.labelBtn.defaultName;

            function PreCheckElemnts(analysisList, compareList) {
                for (var i = 0; i < analysisList.length; i++) {
                    var obj = analysisList[i];
                    if (obj.items === undefined)
                        obj.items = [];
                    if (obj.items.length > 0)
                        PreCheckElemnts(obj.items, compareList);
                    if (compareList.length > 0)
                        for (var j = 0; j < compareList.length; j++) {
                            var item = compareList[j];
                            if (obj.id === item.id) {
                                obj.checked = true;
                                $scope.config.noneChecked = false;
                                break;
                            }
                            else
                                obj.checked = false;
                        }
                    else
                        obj.checked = false;
                }
            }

            function initialChoices(list, father, titlesList) {
                for (var i = 0; i < list.length; i++) {
                    var obj = list[i];
                    if (father.checked)
                        obj.checked = father.checked;
                    if (obj.checked)
                        titlesList.push(obj.text);
                    if (obj.items.length > 0)
                        initialChoices(obj.items, obj, titlesList);
                }
            }

            function renameBtnLabel(titlesList) {
                var temp = "";
                if (titlesList.length === 0)
                    $scope.btnLabel = $scope.labelBtn.defaultName;
                else if (titlesList.length <= $scope.maxBtnLabels) {
                    for (var i = 0; i < titlesList.length; i++)
                        temp += titlesList[i] + "; ";
                    $scope.btnLabel = temp;
                }
                else
                    $scope.btnLabel = $scope.labelBtn.multi + " " + titlesList.length;
            }

            $scope.$watch(function () {
                return $scope.config.tree.length;
            }, function (novo, antigo) {
                if (novo > 0) {
                    var fake_father = {id: "fake", items: [], checked: false};
                    PreCheckElemnts($scope.config.tree, $scope.config.preChecked);
                    $scope.titlesList = [];
                    initialChoices($scope.config.tree, fake_father, $scope.titlesList);
                    renameBtnLabel($scope.titlesList);
                }
            });

            function colectIds(analysisList, returnList, titlesList) {
                for (var i = 0; i < analysisList.length; i++) {
                    var obj = analysisList[i];
                    if (obj.items.length > 0)
                        colectIds(obj.items, returnList, titlesList);
                    if (obj.checked) {
                        returnList.push(obj);
                        titlesList.push(obj.text);
                        $scope.config.noneChecked = false;
                    }
                }
            }

            $scope.$on('ListUpdated', function (event, args) {
                $scope.cmmTimeout = $timeout(function () {
                    $scope.config.postChecked = [];
                    $scope.titlesList = [];
                    $scope.config.noneChecked = true;
                    colectIds($scope.config.tree, $scope.config.postChecked, $scope.titlesList);
                    renameBtnLabel($scope.titlesList);
                }, 300, true);
            });
        }],
        link: function (scope, element, attr) {
            scope.isVisible = false;

            element.bind('click', function (event) {
                event.stopImmediatePropagation();
                if (scope.selectTreeId !== null)
                  $rootScope.$emit('selectTree-open', {id: scope.selectTreeId});
            });

            scope.toggleSelect = function () {
                scope.isVisible = !scope.isVisible;
            };
            
            $rootScope.$on('selectTree-open', function (event, args) {
              if (scope.selectTreeId != args.id) {
                scope.isVisible = false;
                scope.$apply();
              }
            });
            
            $document.bind('click', function () {
                scope.isVisible = false;
                scope.$apply();
            });
        }
    };
}]);

angular.module('bst.directives').directive('bstSelectTree', function () {

    return {
        template: '<ul class="bst-build-select-tree"><bst-choice ng-repeat="choice in tree"></bst-choice></ul>',
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
            tree: '=ngModel'
        }
    };
});

angular.module('bst.directives').directive('bstChoice', ['$compile', function ($compile) {

    return {
        restrict: 'E',
        //In the template, we do the thing with the span so you can click the
        //text or the checkbox itself to toggle the check
        template: '<li class="selectChoice">' +
            '<span ng-click="choiceClicked(choice)">' +
            '<input type="checkbox" ng-checked="checked(choice)">  ' +
            '<div class="imagem_lista_associacao" ng-show="showIndentedSymbol(choice)"></div>' +
            '{{choice.text}}' +
            '</span>' +
            '</li>',
        link: function (scope, elm, attrs) {

            function isChecked(obj) {
                var i;
                if (!obj || typeof(obj) === "undefined") {
                    return false;
                }
                if (typeof(obj.items) === "undefined" || obj.items.length === 0) {
                    //tree leaf
                    return typeof(obj.id) !== "undefined" && obj.checked;
                } else {
                    //traverse children
                    for (i in obj.items) {
                        if (!isChecked(obj.items[i])) {
                            return false;
                        }
                    }
                    return true;
                }
            }

            scope.checked = function (item) {
                var check_value = isChecked(item);
                item.checked = check_value;
                return check_value;
            };

            scope.showIndentedSymbol = function (item) {
                return item.masterId !== null && item.masterId !== undefined;
            };

            scope.choiceClicked = function (choice) {
                choice.checked = !choice.checked;
                function checkChildren(c) {
                    angular.forEach(c.items, function (c) {
                        c.checked = choice.checked;
                        checkChildren(c);
                    });
                }

                checkChildren(choice);
                scope.$emit('ListUpdated', {msg: "List was Updated"});
            };

            //Add children by $compiling and doing a new choice directive
            if (scope.choice.items.length > 0) {
                var childChoice = $compile('<bst-select-tree ng-model="choice.items"></bst-select-tree>')(scope);
                elm.append(childChoice);
            }
        }
    };
}]);
