function ModBox({id, name, onChange, defaultPosition = { x: 0, y: 190 }}) {
  function moveCursor({ x: origX, y: origY, target, buttons }) {
    if (!buttons || !target.classList.contains('mod-box__area')) return;

    const { offsetLeft, offsetTop, clientWidth, clientHeight } = target;

    const cursorElem = target.querySelector('.mod-box__cursor');

    const x = origX - offsetLeft - (cursorElem.clientWidth / 2);
    const y = origY - offsetTop - (cursorElem.clientHeight / 2);

    cursorElem.style.setProperty('left', `${Math.min(x, clientWidth - (cursorElem.clientWidth / 2))}px`);
    cursorElem.style.setProperty('top', `${Math.min(y, clientHeight - cursorElem.clientHeight)}px`);

    const cursorMoveEvent = new CustomEvent('cursormove', { detail: { x: x / clientWidth, y: 1 - (y / clientHeight) }});
    cursorElem.dispatchEvent(cursorMoveEvent);
  }

  const fragment = document.createDocumentFragment();

  const label = document.createElement('span');
  label.classList.add('mod-box__label');
  label.innerText = name;

  const cursor = document.createElement('div');
  cursor.classList.add('mod-box__cursor');
  cursor.style.setProperty('left', `${defaultPosition.x}px`);
  cursor.style.setProperty('top', `${defaultPosition.y}px`);
  cursor.on('cursormove', onChange);

  const boxArea = document.createElement('div');
  boxArea.classList.add('mod-box__area');
  boxArea.on('mousemove', moveCursor);
  boxArea.appendChild(cursor);

  const div = document.createElement('div');
  div.classList.add('mod-box');
  div.id = id;


  div.appendChild(label);
  div.appendChild(boxArea);

  fragment.appendChild(div);

  return fragment;
}
