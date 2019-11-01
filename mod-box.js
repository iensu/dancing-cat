function ModBox({id, name, onChange, defaultPosition = { x: 95, y: 95 }}) {
  function moveCursor({ x: origX, y: origY, target, buttons }) {
    if (!buttons || !target.classList.contains('mod-box')) return;

    const { offsetLeft, offsetTop, clientWidth, clientHeight } = target;

    const cursorElem = target.querySelector('.cursor');

    const x = origX - offsetLeft - (cursorElem.clientWidth / 2);
    const y = origY - offsetTop - (cursorElem.clientHeight / 2);

    cursorElem.style.setProperty('left', `${x}px`);
    cursorElem.style.setProperty('top', `${y}px`);

    const cursorMoveEvent = new CustomEvent('cursormove', { detail: { x: x / clientWidth, y: 1 - (y / clientHeight) }});
    cursorElem.dispatchEvent(cursorMoveEvent);
  }

  const fragment = document.createDocumentFragment();

  const label = document.createElement('span');
  label.classList.add('label');
  label.innerText = name;

  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.style.setProperty('left', `${defaultPosition.x}px`);
  cursor.style.setProperty('top', `${defaultPosition.y}px`);
  cursor.on('cursormove', onChange);

  const div = document.createElement('div');
  div.classList.add('mod-box');
  div.id = id;
  div.on('mousemove', moveCursor);

  div.appendChild(label);
  div.appendChild(cursor);

  fragment.appendChild(div);

  return fragment;
}
