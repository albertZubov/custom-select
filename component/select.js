import { data } from './test-data.js';
import State from './state.js';
const capitalizeFirstLetter = (word) => word[0].toUpperCase() + word.slice(1);

const IDNAME_GROUP = {
  id: Symbol('#'),
  value: 'unname',
  title: 'Unnamed class',
};

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
  BUTTON_DELETE: '.select__toggle--close',
};

const selectAttributes = {
  title: {
    multi: 'Multi',
    single: 'Single',
  },
  value: {
    multi: 'multi',
    single: 'single',
  },
};

const defaultParams = {
  options: [],
};

class CustomSelect extends State {
  #select;
  #searchEl;
  #parentOptions;
  #optionsEl;
  #toggleEl;
  #onClickFn;
  #groupsOptions;
  #quantityTitle;
  #params;

  constructor(targetSelect, params = {}) {
    super({
      activeOptions: [],
      selectIsOpen: false,
      searchValue: '',
    });
    this.#groupsOptions = null;
    this.#quantityTitle = 0;

    this.#select =
      typeof targetSelect === 'string'
        ? document.querySelector(targetSelect)
        : targetSelect;

    this.#params = {
      ...defaultParams,
      ...params,
    };

    if (!this.#params.options.length) {
      return;
    }

    this.#select.classList.add(ClassNames.SELECT);
    this.#select.innerHTML = this.getTemplate();
    this.#searchEl = this.#select.querySelector(Selectors.SEARCH);
    this.#parentOptions = this.#select.querySelector(Selectors.PARENT_OPTIONS);
    this.#optionsEl = this.#select.querySelectorAll(Selectors.OPTION);
    this.#toggleEl = this.#select.querySelector(Selectors.DATA_TOGGLE);
    this.#onClickFn = this.#onClick.bind(this);
    this.#select.addEventListener('click', this.#onClickFn);
    this.#select.addEventListener('input', ({ target }) => {
      if (target.dataset.select === 'input-search') {
        this.setState({ searchValue: target.value });
      }
    });

    this.on('selectIsOpen', (isOpen) => (isOpen ? this.show() : this.hide()));
    this.on('activeOptions', () => this.#update());
    this.on('searchValue', () => this.#changeSearchValue());
  }

  getTemplate() {
    const {
      options,
      name,
      placeholder,
      multiSelect,
      groups,
      groupOptions,
      maxVisibleOptions,
    } = this.#params;

    const { title, value } = selectAttributes;

    // добавление группы "Unname" в массив groups
    groups.push(IDNAME_GROUP);

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

    this.#params.groupedOptions = groups.map(({ id }) =>
      options.filter(({ groupId }) => (groupId || IDNAME_GROUP.id) === id)
    );

    let counter = 0;
    const itemsOptions = this.#params.groupedOptions
      .map((groupElems, index) => {
        //подсчет заголовков для рассчеты высоты скролла
        if (maxVisibleOptions > counter) {
          counter += groupElems.length;
          this.#quantityTitle = index + 1;
        }

        const group = groups.find(
          ({ id }) => (groupElems[0].groupId || IDNAME_GROUP.id) === id
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

  #getActiveOptionTemplate(value) {
    return /*html*/ `<span class="select__toggle--title">
    ${capitalizeFirstLetter(value)}
    <button class="select__toggle--close" data-value="${value}" data-select="delete"></button>
  </span>`;
  }

  #onClick({ target }) {
    const { select: type, value } = target.dataset;

    if (!type) return;

    switch (type) {
      case 'toggle':
        this.toggle();
        break;
      case 'option':
        this.#changeOptionState(target);
        break;
      case 'delete': {
        const option = [...this.#optionsEl].find(
          (el) => el.dataset.value === value
        );
        this.#changeOptionState(option);
        break;
      }
    }
  }

  #changeSearchValue() {
    const searchValue = this.state.searchValue.toLowerCase();
    const groupsEls = [...this.#parentOptions.children];

    const resultOptions = this.#params.groupedOptions
      .map((optionsArr) =>
        optionsArr.filter(({ title }) =>
          title.toLowerCase().includes(searchValue)
        )
      )
      .reduce((result, arr) => {
        result[arr[0]?.groupId || IDNAME_GROUP.id] = arr.map(({ id }) => id);
        return result;
      }, {});

    groupsEls.forEach((groupEl) => {
      const groupId = +groupEl.dataset.id || IDNAME_GROUP.id;
      const includeGroup = resultOptions[groupId];

      groupEl.classList.toggle(ClassNames.HIDE, !includeGroup?.length);

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

  disable() {
    this.#toggleEl.disabled = true;
    this.#toggleEl
      .querySelectorAll(Selectors.BUTTON_DELETE)
      .forEach((el) => (el.disabled = true));

    if (this.#select.classList.contains(ClassNames.ACTIVE)) {
      this.setState({ selectIsOpen: false });
    }
  }

  enable() {
    this.#toggleEl.disabled = false;
    this.#toggleEl
      .querySelectorAll(Selectors.BUTTON_DELETE)
      .forEach((el) => (el.disabled = false));
  }

  #update() {
    if (this.#params.multiSelect) {
      const activeOptions = this.state.activeOptions;
      this.#optionsEl.forEach((option) =>
        option.classList.toggle(
          ClassNames.SELECTED,
          activeOptions.includes(option.dataset.value)
        )
      );

      if (!activeOptions.length)
        return (this.#toggleEl.textContent = 'Выберите из списка');

      this.#toggleEl.innerHTML = activeOptions
        .map(this.#getActiveOptionTemplate)
        .join('');
    } else {
      const option = [...this.#optionsEl].find(
        (el) => el.dataset.value === this.state.activeOptions
      );
      const selected = this.#select.querySelector(Selectors.OPTION_SELECTED);
      if (selected) selected.classList.remove(ClassNames.SELECTED);
      option.classList.add(ClassNames.SELECTED);
      this.#toggleEl.value = option.value;
      this.#toggleEl.textContent = option.textContent;

      this.setState({ selectIsOpen: false });
    }
  }

  reset() {
    const selected = this.#select.querySelector(Selectors.OPTION_SELECTED);
    if (selected) {
      selected.classList.remove(ClassNames.SELECTED);
    }
    this.#toggleEl.textContent = 'Выберите из списка';
    this.#toggleEl.value = '';
    return '';
  }

  #isActiveOption(target) {
    return target.classList.contains(ClassNames.SELECT);
  }

  #changeOptionState(target) {
    const { value } = target.dataset;
    if (this.#isActiveOption(target)) return;

    let stateActiveOptions;
    if (this.#params.multiSelect) {
      stateActiveOptions = this.state.activeOptions.includes(value)
        ? this.state.activeOptions.filter((el) => el !== value)
        : this.state.activeOptions.concat(value);
    } else {
      stateActiveOptions = value;
    }

    this.setState({
      activeOptions: stateActiveOptions,
    });
  }

  #handleEventWindow = (evt) => {
    if (!evt.composedPath().includes(this.#select)) {
      this.setState({ selectIsOpen: false });
    }
  };

  #handleKey = (evt) => {
    if (evt.key === 'Escape') {
      this.setState({ selectIsOpen: false });
    }
    if (evt.target.dataset.select === 'option' && evt.key === 'Enter') {
      this.#changeOptionState(evt.target);
    }
  };

  show() {
    document.querySelectorAll(Selectors.ACTIVE).forEach((select) => {
      select.classList.remove(ClassNames.ACTIVE);
    });
    this.#select.classList.add(ClassNames.ACTIVE);
    this.#searchEl.focus();

    // расчет динамической высоты options
    const groupTitleHeight =
      this.#parentOptions.querySelector(Selectors.GROUP_TITLE)?.offsetHeight ||
      0;
    this.#parentOptions.style.maxHeight = `${
      this.#optionsEl[0].offsetHeight * this.#params.maxVisibleOptions +
      groupTitleHeight * this.#quantityTitle
    }px`;
    this.setState({ selectIsOpen: true });

    // добавление обработчика закрытие селекта при клике вне окна
    document.addEventListener('click', this.#handleEventWindow);

    //добавление обработчика закрытие селекта при клике клавиши Esc
    document.addEventListener('keydown', this.#handleKey);
  }

  hide() {
    this.#select.classList.remove(ClassNames.ACTIVE);
    this.#searchEl.value = '';
    this.#optionsEl.forEach((el) => {
      el.classList.remove(ClassNames.SHOW_OPTION);
    });
    this.setState({ selectIsOpen: false, searchValue: '' });

    // удаление обработчика закрытие селекта при клике вне окна
    document.removeEventListener('click', this.#handleEventWindow);

    // удаление обработчика закрытие селекта при клике клавиши Esc
    document.removeEventListener('keydown', this.#handleKey);
  }

  toggle() {
    this.setState({ selectIsOpen: !this.state.selectIsOpen });
  }

  dispose() {
    this.#select.removeEventListener('click', this.#onClickFn);
  }
}

window.select = new CustomSelect('#select', data);
