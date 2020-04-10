import { LitElement, html } from 'lit-element';
import _ from 'lodash';
import $ from 'jquery';
import slick from 'slick-carousel';
import Glide, { Breakpoints } from '@glidejs/glide';
import preload from 'image-preload';

import { renderFonts, ensureFonts } from './lib/typography.js';
import { renderContents } from './lib/contents.js';

import fonts__suedtirol_pro_woff from './fonts/SuedtirolPro-Regular.woff';
import fonts__suedtirol_next_woff from './fonts/SuedtirolNextTT.woff';
import fonts__suedtirol_next_woff2 from './fonts/SuedtirolNextTT.woff2';
import fonts__suedtirol_next_bold_woff from './fonts/SuedtirolNextTT-Bold.woff';
import fonts__suedtirol_next_bold_woff2 from './fonts/SuedtirolNextTT-Bold.woff2';
import fonts__kievit_regular_woff from './fonts/Kievit.woff';
import fonts__kievit_bold_woff from './fonts/Kievit-Bold.woff';

import styles__normalize from 'normalize.css/normalize.css';
import styles from './tabs.scss';

import assets__button_default_sprite from './images/button-default.svg';
import assets__button_default_tail_sprite from './images/button-default-tail.svg';
import assets__button_active_sprite from './images/button-active.svg';
import assets__button_active_tail_sprite from './images/button-active-tail.svg';
import assets__marker_icon from './images/marker.png';
import assets__arrow_left_icon from './images/arrow-left.svg';
import assets__arrow_right_icon from './images/arrow-right.svg';

const fonts = [
  {
    name: 'pages-suedtirol-next',
    woff: fonts__suedtirol_next_woff,
    woff2: fonts__suedtirol_next_woff2,
    weight: 400
  },
  {
    name: 'pages-kievit',
    woff: fonts__kievit_regular_woff,
    weight: 400
  },
  {
    name: 'pages-kievit',
    woff: fonts__kievit_bold_woff,
    weight: 700
  }
];

class TabsElement extends LitElement {

  constructor() {
    super();

    this.srcUrl = '';
  }

  static get properties() {
    return {
      srcUrl: { attribute: 'src', type: String }
    };
  }

  renderLabel(item) {
    return `
      <li class="glide__slide contains-label">
        <div class="label">
          <div class="header">${item.header}</div>
        </div>
      </li>
    `;
  }

  renderTab(item) {
    return `
      <div class="tab" data-backdrop="${!!item.backdrop ? item.backdrop.src : ''}">
        <div class="tab-contents">
          <div class="contains-images">
            <div class="images">
              ${_.map(item.figures, (figure) => `
                ${figure.type === 'image' ? `
                  <div class="contains-figure contains-image">
                    <div class="image" style="background-image: url('${figure.src}');"></div>
                    ${!!figure.copyright ? `
                      <div class="copyright">
                        <span class="copyright-text">&copy; ${figure.copyright}</span>
                      </div>
                    ` : `` }
                  </div>
                ` : ``}
                ${figure.type === 'map' ? `
                  <div class="contains-figure contains-map">
                    <img src="${figure.src}"/>
                    ${!!figure.point ? `
                      <div class="point" style="left: ${figure.point.x * 100}%; top: ${figure.point.y * 100}%;">
                        <div class="marker" style="background-image: url(${assets__marker_icon});"></div>
                        <div class="caption">${figure.point.caption || ''}</div>
                      </div>
                    ` : ``}
                  </div>
                ` : ``}
              `).join('')}
            </div>
          </div>
          <div class="contains-contents">
            <div class="contents">
              <div class="title">${item.title}</div>
              <div class="subtitle">${item.subtitle}</div>
              <div class="content">${renderContents(item.contents || '')}</div>
              ${!!item.action ? `
                <div class="action">
                  <div class="label">${item.action.header}</div>
                  <a class="link" href="${item.action.permalink}" target="_blank">mehr</a>
                </div>
              ` : ``}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <style>
        ${renderFonts(fonts)}
        ${styles__normalize}
        ${styles}

        #contains-tabs #tabs .tab .tab-contents .action .link {
          background-image: url(data:image/svg+xml;base64,${btoa(assets__button_default_sprite)});
        }

        #contains-tabs #tabs .tab .tab-contents .action .link:after {
          background-image: url(data:image/svg+xml;base64,${btoa(assets__button_default_tail_sprite)});
        }

        #contains-tabs #tabs .tab .tab-contents .action .link:hover {
          background-image: url(data:image/svg+xml;base64,${btoa(assets__button_active_sprite)});
        }

        #contains-tabs #tabs .tab .tab-contents .action .link:hover:after {
          background-image: url(data:image/svg+xml;base64,${btoa(assets__button_active_tail_sprite)});
        }
      </style>
      <div id="root">
        <div id="container">
          <div id="contents"></div>
        </div>
        <div id="wrapper">
          <div id="contains-labels-and-tabs">
            <div id="contains-labels">
              <button type="button" class="prev"><img src="data:image/svg+xml;base64,${btoa(assets__arrow_left_icon)}"/></button>
              <button type="button" class="next"><img src="data:image/svg+xml;base64,${btoa(assets__arrow_right_icon)}"/></button>
              <div id="labels" class="glide">
                <div class="glide__track" data-glide-el="track">
                  <ul class="glide__slides"></ul>
                </div>
              </div>
            </div>
            <div id="contains-tabs">
              <div id="tabs"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async firstUpdated() {
    let self = this;
    let root = self.shadowRoot;

    ensureFonts(fonts);

    if (!!self.srcUrl) {
      fetch(self.srcUrl).then((response) => {
        return response.json();
      }).then((data) => {
        let contentsContainer = root.getElementById('contents');
        contentsContainer.innerHTML = renderContents(data.contents || '');

        if (!!data.items) {
          let labelsList = root.querySelector('#labels ul.glide__slides');
          labelsList.innerHTML = '';

          _.each(data.items, (item) => {
            labelsList.insertAdjacentHTML('beforeend', self.renderLabel(item));
          });

          var slider = new Glide(root.getElementById('labels'), {
            type: 'slider',
            perView: 5,
            gap: 10,
            focusAt: 0,
            breakpoints: {
              992: {
                perView: 3,
                gap: 0
              }
            }
          }).mount();

          let updateLabels = (i) => {
            if (slider.settings.perView === 3) {
              if (i === 0) {
                slider.update({ focusAt: 0 });
              }

              if (i > 0 && i < slides.length) {
                slider.update({ focusAt: 1 });
              }

              if (i === (slides.length - 1)) {
                slider.update({ focusAt: 2 });
              }
            }

            if (slider.settings.perView === 5) {
              if (i < ((slider.settings.perView - 1) / 2)) {
                slider.update({ focusAt: i });
              }

              if (i == ((slider.settings.perView - 1) / 2)) {
                slider.update({ focusAt: ((slider.settings.perView - 1) / 2) });
              }

              if (i > ((slider.settings.perView - 1) / 2)) {
                slider.update({ focusAt: i - 1 });
              }
            }
          };

          let slides = root.querySelectorAll('#labels ul.glide__slides li.glide__slide');
          for (var i = 0; i < slides.length; i++) {
            let slide = slides[i];

            slide.addEventListener('click', (e) => {
              var i = $(slides).index(slide);

              updateLabels(i);

              slider.go('=' + i);

              $(tabsList).slick('slickGoTo', i);

              return false;
            });
          }

          let prevButton = root.querySelector('#contains-labels button.prev');
          prevButton.addEventListener('click', (e) => {
            if (slider.index > 0) {
              slider.go('<');

              updateLabels(slider.index);

              $(tabsList).slick('slickGoTo', slider.index);
            }

            return false;
          });

          let nextButton = root.querySelector('#contains-labels button.next');
          nextButton.addEventListener('click', (e) => {
            if (slider.index < (slides.length - 1)) {
              slider.go('>');

              updateLabels(slider.index);

              $(tabsList).slick('slickGoTo', slider.index);
            }

            return false;
          });

          let tabsList = root.getElementById('tabs');
          tabsList.innerHTML = '';

          _.each(data.items, (item) => {
            tabsList.insertAdjacentHTML('beforeend', self.renderTab(item));
          });

          $(tabsList).slick({
            arrows: false,
            dots: false,
            infinite: true,
            swipe: false
          });

          let updateWrapper = () => {
            var selectedTab = $(tabsList).slick('slickCurrentSlide');
            var tab = $(tabsList).find('.tab')[selectedTab];

            preload([ $(tab).data('backdrop') ], {
              onComplete: () => {
                root.getElementById('wrapper').style.backgroundImage = 'url(' + $(tab).data('backdrop') + ')';
              }
            });
          };

          $(tabsList).on('afterChange', () => {
            updateWrapper();
          });

          updateWrapper();
        }
      });
    }
  }

}

if (!customElements.get('pages-tabs')) {
  customElements.define('pages-tabs', TabsElement);
}