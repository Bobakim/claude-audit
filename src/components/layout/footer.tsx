import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t">
      <Container>
        <div className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2026 한국 회계법인. 모든 권리 보유.
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              원문 감리지적사례집(금융감독원)은 사내 열람 전용이며 외부 재배포를
              금지합니다.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
