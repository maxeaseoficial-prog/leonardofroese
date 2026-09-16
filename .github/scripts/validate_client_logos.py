from __future__ import annotations

import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ.get("PREVIEW_URL", "http://127.0.0.1:4173")
OUT = Path("/tmp/client-logo-validation")
OUT.mkdir(parents=True, exist_ok=True)
EXPECTED_LOGOS = 9

VIEWPORTS = [
    ("desktop-1920", 1920, 1080),
    ("notebook-1440", 1440, 900),
    ("tablet-1024", 1024, 900),
    ("mobile-390", 390, 844),
]


def make_driver(width: int, height: int) -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(f"--window-size={width},{height}")
    options.add_argument("--force-device-scale-factor=1")
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(width, height)
    return driver


def wait_for_logos(driver: webdriver.Chrome) -> None:
    wait = WebDriverWait(driver, 25)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".client-logos")))
    wait.until(
        lambda d: d.execute_script(
            """
            const imgs = [...document.querySelectorAll('.client-logos img')];
            return imgs.length === arguments[0] * 2 &&
              imgs.every(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
            """,
            EXPECTED_LOGOS,
        )
    )


def validate_common(driver: webdriver.Chrome, label: str) -> None:
    values = driver.execute_script(
        """
        const root = document.documentElement;
        const section = document.querySelector('.client-logos');
        const viewport = document.querySelector('.client-logos-viewport');
        const track = document.querySelector('.client-logos-track');
        const items = [...document.querySelectorAll('.client-logo-item')];
        const imgs = [...document.querySelectorAll('.client-logos img')];
        return {
          imageCount: imgs.length,
          allLoaded: imgs.every(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
          minNaturalWidth: Math.min(...imgs.map(img => img.naturalWidth)),
          minNaturalHeight: Math.min(...imgs.map(img => img.naturalHeight)),
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          heading: section?.querySelector('h3')?.textContent?.trim(),
          sectionBackground: section ? getComputedStyle(section).backgroundColor : null,
          viewportBackground: viewport ? getComputedStyle(viewport).backgroundColor : null,
          itemBackgrounds: items.slice(0, 3).map(item => getComputedStyle(item).backgroundColor),
          animationName: track ? getComputedStyle(track).animationName : null,
        };
        """
    )
    if values["imageCount"] != EXPECTED_LOGOS * 2:
        raise AssertionError(f"{label}: expected {EXPECTED_LOGOS * 2} rendered images, got {values['imageCount']}")
    if not values["allLoaded"] or values["minNaturalWidth"] <= 0 or values["minNaturalHeight"] <= 0:
        raise AssertionError(f"{label}: img.complete/naturalWidth validation failed: {values}")
    if values["scrollWidth"] > values["clientWidth"]:
        raise AssertionError(f"{label}: horizontal overflow {values['scrollWidth']} > {values['clientWidth']}")
    if values["heading"] != "Parceiros & Clientes":
        raise AssertionError(f"{label}: unexpected heading {values['heading']!r}")
    transparent = {"rgba(0, 0, 0, 0)", "transparent"}
    backgrounds = [values["sectionBackground"], values["viewportBackground"], *values["itemBackgrounds"]]
    if any(bg not in transparent for bg in backgrounds if bg):
        raise AssertionError(f"{label}: non-transparent logo container background: {backgrounds}")
    if values["animationName"] in (None, "none"):
        raise AssertionError(f"{label}: marquee animation is missing")
    print(f"VALID {label}: {values}")


def validate_direction(driver: webdriver.Chrome, label: str) -> None:
    x1 = driver.execute_script("return document.querySelector('.client-logos-track').getBoundingClientRect().x")
    time.sleep(0.5)
    x2 = driver.execute_script("return document.querySelector('.client-logos-track').getBoundingClientRect().x")
    if x2 <= x1:
        raise AssertionError(f"{label}: marquee is not moving left-to-right: {x1} -> {x2}")
    print(f"VALID {label}: marquee left-to-right {x1:.2f} -> {x2:.2f}")


def screenshot_section(driver: webdriver.Chrome, name: str) -> None:
    section = driver.find_element(By.CSS_SELECTOR, ".client-logos")
    driver.execute_script("arguments[0].scrollIntoView({block:'center'})", section)
    time.sleep(0.2)
    path = OUT / f"{name}.png"
    section.screenshot(str(path))
    print(f"SCREENSHOT {path}")


def validate_home(name: str, width: int, height: int) -> None:
    driver = make_driver(width, height)
    try:
        driver.get(BASE_URL + "/")
        wait_for_logos(driver)
        validate_common(driver, f"home/{name}")
        validate_direction(driver, f"home/{name}")
        screenshot_section(driver, f"home-{name}")
    finally:
        driver.quit()


def seed_diagnostic(driver: webdriver.Chrome) -> None:
    driver.get(BASE_URL + "/")
    WebDriverWait(driver, 20).until(lambda d: d.execute_script("return document.readyState") == "complete")
    driver.execute_script(
        """
        sessionStorage.setItem('caliber-live-lucro-2x-diagnostic', JSON.stringify({
          answers: [2,2,2,2,2,2,2,2,2,2,2,2],
          contact: {
            nome: 'Validação', whatsapp: '41999999999', email: 'validacao@example.com',
            empresa: 'Empresa Teste', segmento: 'Serviços', faturamento: 'c',
            colaboradores: '10', papel: 'Sócio'
          },
          utm: {}
        }));
        """
    )


def validate_raiox() -> None:
    driver = make_driver(390, 844)
    try:
        seed_diagnostic(driver)
        driver.get(BASE_URL + "/raiox/resultado")
        wait_for_logos(driver)
        validate_common(driver, "raiox/resultado/mobile-390")
        after_result = driver.execute_script(
            """
            const result = document.querySelector('.result-shell');
            const logos = document.querySelector('.client-logos');
            return Boolean(result && logos && (result.compareDocumentPosition(logos) & Node.DOCUMENT_POSITION_FOLLOWING));
            """
        )
        if not after_result:
            raise AssertionError("raiox/resultado: logos are not after the completed diagnostic result")
        screenshot_section(driver, "raiox-resultado-mobile-390")
        print("VALID raiox/resultado: client logos render after diagnostic result")
    finally:
        driver.quit()


def validate_reduced_motion() -> None:
    driver = make_driver(1024, 900)
    try:
        driver.execute_cdp_cmd(
            "Emulation.setEmulatedMedia",
            {"features": [{"name": "prefers-reduced-motion", "value": "reduce"}]},
        )
        driver.get(BASE_URL + "/")
        WebDriverWait(driver, 25).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".client-logos")))
        state = driver.execute_script(
            """
            const track = document.querySelector('.client-logos-track');
            const clone = document.querySelector('.client-logos-group[data-clone="true"]');
            return {
              animation: getComputedStyle(track).animationName,
              cloneDisplay: getComputedStyle(clone).display,
              noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            };
            """
        )
        if state["animation"] != "none" or state["cloneDisplay"] != "none" or not state["noOverflow"]:
            raise AssertionError(f"prefers-reduced-motion validation failed: {state}")
        print(f"VALID prefers-reduced-motion: {state}")
    finally:
        driver.quit()


for viewport in VIEWPORTS:
    validate_home(*viewport)
validate_raiox()
validate_reduced_motion()
print("ALL CLIENT LOGO BROWSER VALIDATIONS PASSED")
