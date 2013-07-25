build-select-tree
=================

Component to create a dropdown that contains a tree-view. The component was made using Angularjs. The code was based on this implementation: http://beta.plnkr.co/edit/aNHZh6?p=preview

The intention was to create a component as independent as possible and with some settings that can be modified by the user. I will make more changes in the future.

HOW TO USE:

The component consists of three directives, but only one of them should be used. In your HTML code should be written:

<build-select-tree config="config"> </ build-tree-select>

"config" is the set of configurations that will be passed to the component.


SETTINGS:

The settings have to be provided in the format of an object:
Config = {
  disabled: true,
  noneChecked: true,
  labelBtn: {
    defaultName: "Select ...",
    multi: "Selected:"
  }
  maxBtnLabels: 2
  tree: []
  preChecked: []
  postChecked: []
}


WHAT IS EACH SETTING:

disabled: if true then the dropdown will be disabled. (must be given)

noneChecked: if true then there is no item selected.

labelBtn: Label button's dropdown.

labelBtn.defaultName: Default label when there is no selected item.

labelBtn.multi: Label when more than one item is selected. What appears is the label plus the amount of selected items. Example: Selected: 5.

maxBtnLabels: How many names of selected items will be displayed on the button.

tree: tree of elements. (must be given)

preChecked: list of ids of the elements that should be selected when loading the tree.

postChecked: list of ids of the items selected by the user.


Example:
http://plnkr.co/edit/RbJUCb?p=preview
