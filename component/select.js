import { data } from './test-data.js';
const capitalizeFirstLetter = (word) => word[0].toUpperCase() + word.slice(1);

const ClassNames = {
  SELECT: 'select',
  ACTIVE: 'select--show',
  SELECTED: 'select__option--selected',
  SHOW_OPTION: 'select__option-hide',
  SHOW_GROUP_LIST: 'select__group-list--hide',
  ACTIVE_BUTTON: 'select__button-active',
  HIDE: 'hide',
};

const Selectors = {
  ACTIVE: '.select_show',
  DATA: '[data-select]',
  DATA_TOGGLE: '[data-select="toggle"]',
  OPTION_SELECTED: '.select__option--selected',
  OPTION: '.select__option',
  SEARCH: '.select__search',
  PARENT_OPTIONS: '.select__options',
  GROUP_TITLE: '.select__group-title',
};

const defaultParams = {
  options: [],
};

class CustomSelect {
  constructor(target, params = {}) {
    this._select =
      typeof target === 'string' ? document.querySelector(target) : target;

    this._params = {
      ...defaultParams,
      ...params,
    };

    if (!this._params.options.length) {
      return;
    }

    this._select.classList.add(ClassNames.SELECT);
    this._select.innerHTML = this.getTemplate();
    this._searchEl = this._select.querySelector(Selectors.SEARCH);
    this._parentOptions = this._select.querySelector(Selectors.PARENT_OPTIONS);
    this._onClickFn = this._onClick.bind(this);
    this._optionsEl = this._select.querySelectorAll(Selectors.OPTION);
    this._toggleEl = this._select.querySelector(Selectors.DATA_TOGGLE);
    this._select.addEventListener('click', this._onClickFn);
    this._select.addEventListener('input', this._changeSearchValue.bind(this));

    this._groupsOptions = null;
    this._activeNodeOptions = [];
    this._quantityTitle = 0;

    // this._state = {
    //   activeOptions: [],
    // };
  }

  // setState() {}

  getTemplate() {
    const {
      options,
      name,
      placeholder,
      title,
      multiSelect,
      groups,
      groupOptions,
      value,
      maxVisibleOptions,
    } = this._params;

    // добавление группы "Unname" в массив groups
    const idUnname = Symbol('#');
    groups.push({
      id: idUnname,
      value: 'unname',
      title: 'Unnamed class',
    });

    const createOption = (
      option
    ) => /*html*/ `<li class="select__option" tabindex='0' data-select="option" data-id="${
      option.id
    }" data-value="${option.value}">
    <span class="select__option--icon-${
      multiSelect ? value.multi : value.single
    }"></span>
  ${option.title}
  </li>`;

    this._params.groupedOptions = groups.map(({ id }) =>
      options.filter(({ groupId }) => (groupId || idUnname) === id)
    );

    let counter = 0;
    const itemsOptions = this._params.groupedOptions
      .map((groupElems, index) => {
        //подсчет заголовков для рассчеты высоты скролла
        if (maxVisibleOptions > counter) {
          counter += groupElems.length;
          this._quantityTitle = index + 1;
        }

        console.log(this._quantityTitle);

        const group = groups.find(
          ({ id }) => (groupElems[0].groupId || idUnname) === id
        );

        const titleGroup = group.title;
        const groupId = group.id;

        return /*html*/ `<li class="select__group-list" data-id="${groupId.toString()}" data-select="group">
      ${
        groupOptions
          ? /*html*/ `<span class="select__group-title">${titleGroup}</span>`
          : ''
      }
        <ul class="select__group-options">
        ${groupElems.map(createOption).join('')}
        </ul>
        </li>`;
      })
      .join('');

    return /*html*/ `
    <h3 class="select__title">${
      multiSelect ? title.multi : title.single
    } select</h3>
    <button type="button" class="select__toggle" name="${name}" value="${placeholder}" data-select="toggle">${placeholder}</button>
    <div class="select__dropdown">
      <input type="text" tabindex='0' placeholder="Search" class="select__search" value="" data-select="input-search"/>
      <ul class="select__options">${itemsOptions}</ul>
    </div>`;
  }

  _getActiveOptionTemplate(value) {
    return /*html*/ `<span class="select__toggle--title">
    ${capitalizeFirstLetter(value)}
    <button class="select__toggle--close" data-value="${value}" data-select="delete"></button>
  </span>`;
  }

  _onClick({ target }) {
    const { select: type, value } = target.dataset;

    if (!type) return;

    switch (type) {
      case 'toggle':
        this.toggle();
        break;
      case 'button':
        this._changeSelect(target);
        break;
      case 'option':
        this._changeOptionState(target);
        break;
      case 'delete': {
        const option = [...this._optionsEl].find(
          (el) => el.dataset.value === value
        );
        this._changeOptionState(option);
        break;
      }
    }
  }

  _changeSearchValue({ target }) {
    if (target.dataset.select === 'input-search') {
      const searchValue = target.value.toLowerCase();
      const groupsEls = [...this._parentOptions.children];
      const idUnname = Symbol('#');

      const resultOptions = this._params.groupedOptions
        .map((optionsArr) =>
          optionsArr.filter(({ title }) =>
            title.toLowerCase().includes(searchValue)
          )
        )
        .reduce((result, arr) => {
          result[arr[0]?.groupId || idUnname] = arr.map(({ id }) => id);
          return result;
        }, {});

      groupsEls.forEach((groupEl) => {
        const groupId = +groupEl.dataset.id || idUnname;
        const includeGroup = resultOptions[groupId];

        groupEl.classList.toggle(
          ClassNames.HIDE,
          includeGroup === undefined || includeGroup.length
            ? !includeGroup
            : true
        );

        if (!includeGroup) return;

        groupEl.querySelectorAll('[data-select=option]').forEach((optionEl) => {
          const optionId = +optionEl.dataset.id;
          optionEl.classList.toggle(
            ClassNames.HIDE,
            !includeGroup.includes(optionId)
          );
        });
      });
    }
  }

  _updateSingle(option) {
    const selected = this._select.querySelector(Selectors.OPTION_SELECTED);
    if (selected) selected.classList.remove(ClassNames.SELECTED);
    option.classList.add(ClassNames.SELECTED);
    this._toggleEl.textContent = option.textContent;
    this._toggleEl.value = option.dataset.value;
  }

  changeActiveOption(id) {
    const option = [...this._optionsEl].find((el) => +el.dataset.id === +id);
    if (option) {
      this._params.multiSelect
        ? this._updateMulti(option)
        : this._updateSingle(option);
    } else {
      throw 'Invalid ID';
    }
  }

  // removeActiveOption () {

  // }

  disable() {
    this._toggleEl.disabled = true;
    if (this._select.classList.contains(ClassNames.ACTIVE)) this.hide();
  }

  enable() {
    this._toggleEl.disabled = false;
  }

  _updateMulti(option) {
    const { value } = option.dataset;
    option.classList.toggle(ClassNames.SELECTED);

    if (option.classList.contains(ClassNames.SELECTED)) {
      this._activeNodeOptions.push(value);
    } else {
      this._activeNodeOptions = this._activeNodeOptions.filter(
        (el) => el !== value
      );
    }

    this._toggleEl.innerHTML = this._activeNodeOptions
      .map((el) => this._getActiveOptionTemplate(el))
      .join('');

    if (!this._activeNodeOptions.length)
      this._toggleEl.textContent = 'Выберите из списка';
  }

  _reset() {
    const selected = this._select.querySelector(Selectors.OPTION_SELECTED);
    if (selected) {
      selected.classList.remove(ClassNames.SELECTED);
    }
    this._toggleEl.textContent = 'Выберите из списка';
    this._toggleEl.value = '';
    return '';
  }

  _changeOptionState(target) {
    if (target.classList.contains(ClassNames.SELECT)) return;

    if (this._params.multiSelect) {
      this._updateMulti(target);
    } else {
      this._updateSingle(target);
      this.hide();
    }
  }

  handleEventWindow = (evt) => {
    if (!evt.composedPath().includes(this._select)) return this.hide();
  };

  handleKey = (evt) => {
    if (evt.key === 'Escape') return this.hide();
    if (evt.target.dataset.select === 'option' && evt.key === 'Enter') {
      this._params.multiSelect
        ? this._updateMulti(evt.target)
        : this._updateSingle(evt.target);
    }
  };

  show() {
    document.querySelectorAll(Selectors.ACTIVE).forEach((select) => {
      select.classList.remove(ClassNames.ACTIVE);
    });
    this._select.classList.add(ClassNames.ACTIVE);
    this._searchEl.focus();

    console.log(this._quantityTitle);

    // расчет динамической высоты options
    const groupTitleHeight =
      this._parentOptions.querySelector(Selectors.GROUP_TITLE)?.offsetHeight ||
      0;
    this._parentOptions.style.maxHeight = `${
      this._optionsEl[0].offsetHeight * this._params.maxVisibleOptions +
      groupTitleHeight * this._quantityTitle
    }px`;

    // закрытие селекта при клике вне окна
    document.addEventListener('click', this.handleEventWindow);

    // закрытие селекта при клике клавиши Esc
    document.addEventListener('keydown', this.handleKey);
  }

  hide() {
    this._select.classList.remove(ClassNames.ACTIVE);
    this._searchEl.value = '';
    this._optionsEl.forEach((el) => {
      el.classList.remove(ClassNames.SHOW_OPTION);
    });

    // закрытие селекта при клике вне окна
    document.removeEventListener('click', this.handleEventWindow);

    // закрытие селекта при клике клавиши Esc
    document.removeEventListener('keydown', this.handleKey);
  }

  toggle() {
    this._select.classList.contains(ClassNames.ACTIVE)
      ? this.hide()
      : this.show();
  }

  dispose() {
    this._select.removeEventListener('click', this._onClickFn);
  }
}

window.select = new CustomSelect('#select', data);
