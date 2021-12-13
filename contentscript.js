const wait = function (milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
};

const autoscrollToElement = async function (cssSelector = "body") {
  let exits = document.querySelector(cssSelector);
  console.log(exits);
  let oldScrollY = -1;
  while (exits) {
    let currentScrollY = window.scrollY;
    if (oldScrollY === currentScrollY) break;

    await wait(30);

    window.scrollTo(0, currentScrollY + 20);
    oldScrollY = currentScrollY;
  }

  console.log(`Scroll end:  ${exits}`);

  return new Promise((res) => {
    res();
  });
};

const clickOnButton = async (tag) => {
  const elementMore = document.querySelector(tag);
  if (elementMore) elementMore.click();
};

const sendData = async (url, document) => {
  try {
    const fetchOptions = {
      method: "POST",
      body: document,
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, fetchOptions);
    const { data = {}, success } = await response.json();
    //const { data } = await response.json();

    if (success) return data;
    throw new Error("Error when load response from backend");
  } catch (error) {
    console.log("🚀 ~ file: index.html ~ line 22 ~ sendData ~ error", error);
    throw error;
  }
};

const scrapingProfile = async () => {
  //Logic
  const selectorProfile = {
    personalInformation: {
      name: ".text-heading-xlarge",
      country: "div.mt2>div.pb2>span.text-body-small",
      title:
        "div.ph5>div.mt2>div:nth-child(1)>div.text-body-medium.break-words",
      resume: "div.pv-oc>section.pv-profile-section.pv-about-section>div",
      email:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-email a",
      webSite:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-websites a",
      urlLinkedin:
        "div.artdeco-modal div.artdeco-modal__content section.pv-profile-section section.ci-vanity-url a",
      phone: "section.ci-phone>ul>li>span",
      contactButton:
        "div.ph5>div.mt2>div.pb2>span.pv-text-details__separator>a",
      closeContact: "button.artdeco-modal__dismiss",
    },
    experienceInformation: {
      list: "#experience-section > ul > li",
      showAllExperience:
        "#experience-section>div.pv-experience-section__see-more>button.pv-profile-section__see-more-inline",
      groupByCompany: {
        identify: ".pv-entity__position-group",
        company: "div.pv-entity__company-summary-info > h3 > span:nth-child(2)",
        list: "section > ul > li",
        title: "div>div>div>div>div>div>h3>span:nth-child(2)",
        date: "div > div > div > div > div > div > div > h4 > span:nth-child(2)",
        description: ".pv-entity__description",
        showAllPositions: "button.pv-profile-section__see-more-inline",
      },
      // Para cada Card de Experiencia no agrupada
      default: {
        title: "section > div > div > a > div.pv-entity__summary-info > h3",
        company:
          "section > div > div > a > div.pv-entity__summary-info > p.pv-entity__secondary-title",
        date: "section > div > div > a > div.pv-entity__summary-info > div > h4.pv-entity__date-range > span:nth-child(2)",
        description:
          "section.pv-profile-section__card-item-v2.pv-profile-section > div > div > div > div",
      },
    },
    educationInformation: {
      showAllEducation:
        ".pv-profile-section-pager section.education-section  button.pv-profile-section__see-more-inline",
      list: "#education-section > ul > li",
      institution: "div > div > a > div.pv-entity__summary-info > div > h3",
      career:
        "div > div > a > div.pv-entity__summary-info > div > p > span:nth-child(2)",
      date: "div > div > a > div.pv-entity__summary-info > p > span:nth-child(2)",
      description: "div>div>div>p.pv-entity__description",
    },
  };

  const getPersonalInformation = async () => {
    const { personalInformation: selector } = selectorProfile;
    const elementNameProfile = document.querySelector(selector.name);
    const elementNameTitle = document.querySelector(selector.title);
    const elementCountry = document.querySelector(selector.country);
    const elementResume = document.querySelector(selector.resume);

    const name = elementNameProfile?.innerText;
    const title = elementNameTitle?.innerText;
    const country = elementCountry?.innerText;
    const resume = elementResume?.innerText;

    await clickOnButton(selector.contactButton);
    await wait(2000);
    const elementEmail = document.querySelector(selector.email);
    const elementWebSite = document.querySelector(selector.webSite);
    const elementUrlLinkedin = document.querySelector(selector.urlLinkedin);
    const elementPhone = document.querySelector(selector.phone);

    const email = elementEmail?.innerText;
    const webSite = elementWebSite?.innerText;
    const urlLinkedin = elementUrlLinkedin?.innerText;
    const phone = elementPhone?.innerText;

    await clickOnButton(selector.closeContact);

    await wait(500);

    return {
      name,
      title,
      country,
      resume,
      email,
      webSite,
      urlLinkedin,
      phone,
    };
  };

  const getExperienceInformation = async () => {
    await autoscrollToElement("body");
    const { experienceInformation: selector } = selectorProfile;
    //get information
    await clickOnButton(selector.showAllExperience);
    await wait(1000);

    let experiencesRawList = document.querySelectorAll(selector.list);
    let experiencesRawArray = Array.from(experiencesRawList);

    const groupCompaniesList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length > 0;
    });

    const uniqueExperienceList = experiencesRawArray.filter((el) => {
      let groupCompanyExperience = el.querySelectorAll(
        selector.groupByCompany.identify
      );
      return groupCompanyExperience.length == 0;
    });

    const experiences = uniqueExperienceList.map((el) => {
      const title = el.querySelector(selector.default.title)?.innerText;
      const date = el.querySelector(selector.default.date)?.innerText;
      const company = el.querySelector(selector.default.company)?.innerText;
      const description = el.querySelector(
        selector.default.description
      )?.innerText;

      return { title, date, company, description };
    });

    for (let i = 0; i < groupCompaniesList.length; i++) {
      const item = groupCompaniesList[i];

      const verMas = item.querySelector(
        selector.groupByCompany.showAllPositions
      );
      if (verMas) verMas.click();
      await wait(500);

      const company = item.querySelector(
        selector.groupByCompany.company
      )?.innerText;
      const itemsCompanyGroupList = item.querySelectorAll(
        selector.groupByCompany.list
      );
      const itemsCompanyGroupArray = Array.from(itemsCompanyGroupList);

      const experiencesData = itemsCompanyGroupArray.map((el) => {
        const title = el.querySelector(
          selector.groupByCompany.title
        )?.innerText;
        const date = el.querySelector(selector.groupByCompany.date)?.innerText;
        const description = el.querySelector(
          selector.groupByCompany.description
        )?.innerText;

        return { title, date, company, description };
      });

      experiences.push(...experiencesData);
    }

    return experiences;
  };

  const getEducationInformation = async () => {
    const { educationInformation: selector } = selectorProfile;

    await clickOnButton(selector.showAllEducation);
    await wait(600);

    const educationItems = document.querySelectorAll(selector.list);
    const educationArray = Array.from(educationItems);
    const educations = educationArray.map((el) => {
      const institution = el.querySelector(selector.institution)?.innerText;
      const career = el.querySelector(selector.career)?.innerText;
      const date = el.querySelector(selector.date)?.innerText;
      const description = el.querySelector(selector.description)?.innerText;
      return { institution, career, date, description };
    });
    return educations;
  };

  const createPopup = () => {
    const styleDiv =
      "position: fixed;z-index: 2000;width:100%; top: 0px;left: 0px;overflow: visible;display: flex;align-items: flex-end;background-color: lightgray;font-size: 10px;padding: 10px;";
    const stylePre =
      "position: relative;max-height: 400px;overflow: scroll;width: 100%;";
    const div = document.createElement("div");
    div.id = "krowdy-message";
    div.style = styleDiv;

    const pre = document.createElement("pre");
    pre.id = "krowdy-pre";
    pre.style = stylePre;

    const button = document.createElement("button");

    button.id = "krowdy-button";
    button.style = "background: gray;border: 2px solid;padding: 8px;";
    button.innerText = "Aceptar";

    const bodyElement = document.querySelector("div.body");

    bodyElement.appendChild(div);

    pre.innerText = "Estamos extrayendo la información!!!!";
    div.appendChild(pre);
    div.appendChild(button);
    return { div, pre, button };
  };

  //Scroll to all information
  const { div, pre, button } = createPopup();

  pre.innerText = "Scaneando el perfil";

  const personalInformation = await getPersonalInformation();
  const experienceInformation = await getExperienceInformation();
  const educationInformation = await getEducationInformation();

  pre.innerText = "Ya tenemos las información del perfil";
  await wait(300);

  const profile = {
    ...personalInformation,
    experiences: experienceInformation,
    educations: educationInformation,
  };

  const urlHost = "http://localhost:5000/api/profiles/addProfile";

  pre.innerText =
    "Enviando a MongoDB -> http://localhost:5000/api/profiles/getAllProfiles";

  const stringData = JSON.stringify(profile);
  const responseMessage = await sendData(urlHost, stringData);

  button.addEventListener("click", () => {
    //Necesito el fetch
    div.remove();
  });

  //console.log(profile);
  pre.innerText = `Se envio correctamente ...
    >> Datos en MongoDB -> http://localhost:5000/api/profiles/getAllProfiles`;
  //return profile;
};

const setUrls = async () => {
  let results = document.querySelectorAll(
    "div.search-results-container div.pv2.artdeco-card.ph0.mb2 ul li div.entity-result__content span.entity-result__title-text a"
  );
  let resultsArray = Array.from(results);
  let urlrResult = resultsArray.map((e) => e.href);
  localStorage.setItem("urls", JSON.stringify(urlrResult));
};

const getUrl = () => {
  let urls = JSON.parse(localStorage.getItem("urls"));
  localStorage.setItem("urls", JSON.stringify(urls.slice(1)));
  return urls[0];
};

(function () {
  chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(async (message) => {
      const { action } = message;
      if (action == "inicia") {
        await setUrls();
        await chrome.runtime.sendMessage({ action: getUrl() });
      } else if (action == "scrapingProfile") {
        await scrapingProfile();
        let urlPass = getUrl();
        if (urlPass) {
          await chrome.runtime.sendMessage({ action: urlPass });
        } else {
          await chrome.runtime.sendMessage({ action: "fin" });
        }
      } else if (action == "fin") {
        localStorage.setItem("status", "{fin: true}");
      }
    });
  });
})();
