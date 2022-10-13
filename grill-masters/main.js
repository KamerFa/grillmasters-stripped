const whatsButtons = document.querySelectorAll("[data-slider-button]")

whatsButtons.forEach(button => {

    button.addEventListener("click", () => {
        const offset = button.dataset.sliderButton === "next" ? 1 : -1
        const slides = button
        .closest("[data-slider]")
        .querySelector("[data-slides]")

        const activeSlide = slides.querySelector("[data-active]")
        let newIndex = [...slides.children].indexOf(activeSlide) + offset
        if(newIndex < 0) newIndex = slides.children.length - 1
        if(newIndex >= slides.children.length) newIndex = 0

        slides.children[newIndex].dataset.active = true
        delete activeSlide.dataset.active
    })

})

const slider = document.querySelector('.slidertest');
let isDown = false;
let startX;
let sLeft;
slider.scrollLeft = 0;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX;
  sLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
});
slider.addEventListener('mouseup', () => {
  isDown = false;
});

slider.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX;
  const dragged = x - startX;
  slider.scrollLeft = sLeft - dragged;
}); 