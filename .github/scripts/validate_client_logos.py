from __future__ import annotations

import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ.get("PREVIEW_URL", "http://127.0.0.1:4173")
OUT = Path("/tmp/client-logo-validation")
OUT.mkdir(parents=True, exist_ok=True)

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


def wait_for_logos(driver: webdriver.Chrome):
    wait = WebDriverWait(driver, 25)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".client-logos")))
    wait.until(
        lambda d: d.execute_script(
            """
            const imgs = [...document.querySelectorAll('.client-logos img')];
            return imgs.length >= 40 && imgs.every(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
            """
        )
    )


def assert_common(driver: webdriver.Chrome, label: str) -> None:
    values = driver.execute_script(
        """
        const root = document.documentElement;
        const section = document.querySelector('.client-logos');
        const viewport = document.querySelector('.client-logos-viewport');
        const items = [...document.querySelectorAll('.client-logo-item')];
        const imgs = [...document.querySelectorAll('.client-logos img')];
        const heading = section?.querySelector('h3')?.textContent?.trim();
        const backgrounds = [section, viewport, ...items.slice(0, 3)].map(el => el ? getComputedStyle(el).backgroundColor : null);
        return {
          imageCount: imgs.length,
          allLoaded: imgs.every(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
          minNaturalWidth: Math.min(...imgs.map(img => img.naturalWidth)),
          heading,
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          sectionRight: section?.getBoundingClientRect().right,
          sectionLeft: section?.getBoundingClientRect().left,
          backgrounds,
          animationName: getComputedStyle(document.querySelector('.client-logos-track')).animationName,
          animationDuration: getComputedStyle(document.querySelector('.client-logos-track')).animationDuration,
        };
        """
    )
    if values["imageCount"] != 40:
        raise AssertionError(f"{label}: expected 40 rendered images (20 + clone), got {values['imageCount']}")
    if not values["allLoaded"] or values["minNaturalWidth"] <= 0:
        raise AssertionError(f"{label}: one or more logos failed img.complete/naturalWidth validation: {values}")
    if values["scrollWidth"] > values["clientWidth"] + 1:
        raise AssertionError(
            f"{label}: horizontal overflow {values['scrollWidth']} > {values['clientWidth']}"
        )
    if values["heading"] != "Parceiros & Clientes":
        raise AssertionError(f"{label}: unexpected heading: {values['heading']!r}")
    if values["animationName"] == "none":
        raise AssertionError(f"{label}: marquee animation is not active")
    if any(bg not in ("rgba(0, 0, 0, 0)", "transparent") for bg in values["backgrounds"] if bg):
        raise AssertionError(f"{label}: non-transparent logo container background detected: {values['backgrounds']}")
    print(f"VALID {label}: {values}")


def assert_left_to_right(driver: webdriver.Chrome, label: str) -> None:
    x1 = driver.execute_script(
        "return document.querySelector('.client-logos-track').getBoundingClientRect().x"
    )
    time.sleep(0.45)
    x2 = driver.execute_script(
        "return document.querySelector('.client-logos-track').getBoundingClientRect().x"
    )
    if x2 <= x1:
        raise AssertionError(f"{label}: marquee is not moving left-to-right: {x1} -> {x2}")
    print(f"VALID {label}: marquee left-to-right {x1:.2f} -> {x2:.2f}")


def assert_hover_pause(driver: webdriver.Chrome, label: str) -> None:
    viewport = driver.find_element(By.CSS_SELECTOR, ".client-logos-viewport")
    driver.execute_script("arguments[0].scrollIntoView({block:'center'})", viewport)
    ActionChains(driver).move_to_element(viewport).perform()
    time.sleep(0.15)
    state = driver.execute_script(
        "return getComputedStyle(document.querySelector('.client-logos-track')).animationPlayState"
    )
    if state != "paused":
        raise AssertionError(f"{label}: hover did not pause marquee; state={state}")
    print(f"VALID {label}: hover pause")


def save_section_screenshot(driver: webdriver.Chrome, name: str) -> None:
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
        assert_common(driver, f"home/{name}")
        assert_left_to_right(driver, f"home/{name}")
        if width >= 1024:
            assert_hover_pause(driver, f"home/{name}")
        save_section_screenshot(driver, f"home-{name}")
    finally:
        driver.quit()


def seed_result_session(driver: webdriver.Chrome) -> None:
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


def validate_result() -> None:
    driver = make_driver(390, 844)
    try:
        seed_result_session(driver)
        driver.get(BASE_URL + "/raiox/resultado")
        wait_for_logos(driver)
        assert_common(driver, "raiox/resultado/mobile-390")
        order_ok = driver.execute_script(
            """
            const result = document.querySelector('.result-shell');
            const logos = document.querySelector('.client-logos');
            if (!result || !logos) return false;
            return Boolean(result.compareDocumentPosition(logos) & Node.DOCUMENT_POSITION_FOLLOWING);
            """
        )
        if not order_ok:
            raise AssertionError("raiox/resultado: client logos are not after the diagnostic result")
        save_section_screenshot(driver, "raiox-resultado-mobile-390")
        print("VALID raiox/resultado: logos appear after diagnostic result and before following content")
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
        wait = WebDriverWait(driver, 25)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".client-logos")))
        state = driver.execute_script(
            """
            const track = document.querySelector('.client-logos-track');
            const clone = document.querySelector('.client-logos-group[data-clone="true"]');
            return {
              animation: getComputedStyle(track).animationName,
              cloneDisplay: getComputedStyle(clone).display,
              overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
            };
            """
        )
        if state["animation"] != "none" or state["cloneDisplay"] != "none" or not state["overflow"]:
            raise AssertionError(f"prefers-reduced-motion validation failed: {state}")
        print(f"VALID prefers-reduced-motion: {state}")
    finally:
        driver.quit()


for viewport in VIEWPORTS:
    validate_home(*viewport)
validate_result()
validate_reduced_motion()
print("ALL CLIENT LOGO BROWSER VALIDATIONS PASSED")
